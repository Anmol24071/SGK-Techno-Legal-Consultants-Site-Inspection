import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return [];
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
