import NextAuth, { type NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";

export const authOptions: NextAuthOptions = {
  callbacks: {
    //Se a gente usasse database como estrategia
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }
      return session;
    },
    // jwt({ token, user }) {
    //   if (user) {
    //     token.id = user?.id;
    //     token.role = user?.role;
    //     token.picture = user?.image;
    //     console.log("token here meu men", token);
    //   }
    //   return token;
    // },
    async redirect({ baseUrl }) {
      return `${baseUrl}/`;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID as string,
      clientSecret: env.GITHUB_CLIENT_SECRET as string,
    }),
  ],
  pages: { signIn: "/login" },
  debug: env.NODE_ENV === "development" ? true : false,
};

export default NextAuth(authOptions);
