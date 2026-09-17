import { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import { sendAccessEmail } from "./email";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      httpOptions: {
        timeout: 15000,
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        const adminEmail = (process.env.ADMIN_EMAIL || "tarachandanianil@gmail.com").trim().toLowerCase();
        const isAdmin = user.email.trim().toLowerCase() === adminEmail;

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
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }
      if (token.email) {
        const adminEmail = (process.env.ADMIN_EMAIL || "tarachandanianil@gmail.com").trim().toLowerCase();
        const isAdmin = token.email.trim().toLowerCase() === adminEmail;

        const dbUser = await prisma.user.findUnique({
          where: { email: token.email.toLowerCase() },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = isAdmin ? "ADMIN" : dbUser.role;
          token.status = isAdmin ? "APPROVED" : dbUser.status;
          token.name = dbUser.name;
          token.picture = dbUser.image || undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).status = token.status;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "sgk_techno_legal_super_secret_session_key_2026",
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
