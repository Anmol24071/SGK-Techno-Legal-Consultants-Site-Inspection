import { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import { sendAccessEmail } from "./email";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "705165472131-bhls3dmdfs7n4jqgmsgp4pmjvvc1s5s7.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "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";
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "sgk_techno_legal_super_secret_session_key_2026";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "tarachandanianil@gmail.com";

if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes("localhost")) {
  if (process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  } else {
    process.env.NEXTAUTH_URL = "https://sgk-techno-legal-consultants-si.vercel.app";
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      httpOptions: {
        timeout: 15000,
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        const adminEmail = ADMIN_EMAIL.trim().toLowerCase();
        const isAdmin = user.email.trim().toLowerCase() === adminEmail;

        try {
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email.toLowerCase() },
          });

          if (!dbUser) {
            // First time sign-in: create user record
            dbUser = await prisma.user.create({
              data: {
                googleId: account.providerAccountId,
                name: user.name || "Site Inspector",
                email: user.email.toLowerCase(),
                image: user.image || null,
                role: isAdmin ? "ADMIN" : "EMPLOYEE",
                status: isAdmin ? "APPROVED" : "PENDING",
              },
            });

            if (!isAdmin) {
              // Create Access Request record
              try {
                await prisma.accessRequest.create({
                  data: {
                    userId: dbUser.id,
                    name: dbUser.name,
                    email: dbUser.email,
                    image: dbUser.image,
                    googleId: account.providerAccountId,
                    status: "PENDING",
                  },
                });
              } catch (arErr) {
                console.error("AccessRequest creation error:", arErr);
              }

              try {
                // Dispatch confirmation email to Visitor's verified Google account email (Requirement 4A)
                await sendAccessEmail({
                  to: dbUser.email,
                  name: dbUser.name,
                  type: "PROFILE_SHARED",
                });

                // Dispatch instant email notification to Chief Admin
                await sendAccessEmail({
                  to: adminEmail,
                  name: dbUser.name,
                  type: "NEW_REQUEST",
                });
              } catch (emailErr) {
                console.error("Non-blocking email dispatch error during Google signIn:", emailErr);
              }
            }
          } else {
            // Existing user sign-in update
            const updatedRole = isAdmin ? "ADMIN" : dbUser.role;
            const updatedStatus = isAdmin ? "APPROVED" : dbUser.status;

            try {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: {
                  googleId: account.providerAccountId,
                  name: user.name || dbUser.name,
                  image: user.image || dbUser.image,
                  role: updatedRole,
                  status: updatedStatus,
                  lastLoginAt: new Date(),
                },
              });
            } catch (updErr) {
              console.error("User update error:", updErr);
            }
          }
        } catch (dbErr) {
          console.error("Prisma Database Error in signIn callback (non-fatal):", dbErr);
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }
      if (token.email) {
        const adminEmail = ADMIN_EMAIL.trim().toLowerCase();
        const isAdmin = token.email.trim().toLowerCase() === adminEmail;

        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email.toLowerCase() },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.role = isAdmin ? "ADMIN" : dbUser.role;
            token.status = isAdmin ? "APPROVED" : dbUser.status;
            token.name = dbUser.name;
            token.picture = dbUser.image || undefined;
          } else {
            token.role = isAdmin ? "ADMIN" : "EMPLOYEE";
            token.status = isAdmin ? "APPROVED" : "PENDING";
          }
        } catch (dbErr) {
          console.error("Prisma Database Error in jwt callback (fallback enabled):", dbErr);
          token.role = isAdmin ? "ADMIN" : "EMPLOYEE";
          token.status = isAdmin ? "APPROVED" : "PENDING";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id || "temp-id";
        (session.user as any).role = token.role || "EMPLOYEE";
        (session.user as any).status = token.status || "PENDING";
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: NEXTAUTH_SECRET,
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: "ADMIN" | "EMPLOYEE";
    status: "PENDING" | "APPROVED" | "DENIED" | "REVOKED";
  };
}
