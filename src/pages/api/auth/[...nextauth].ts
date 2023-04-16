import NextAuth, { AuthOptions, Session } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "src/libs/server/prisma";
import KakaoProvider from "next-auth/providers/kakao";
import GoogleProvider from "next-auth/providers/google";

export type ExtendedSession = Session & { id: string };

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async redirect({ baseUrl }) {
      return baseUrl;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        (session as ExtendedSession).id = token.id as string;
      }

      return session;
    },
  },
  session: {
    strategy: "jwt",
  },

  providers: [
    KakaoProvider({
      clientId: process.env.NEXT_PUBLIC_KAKAO_ID as string,
      clientSecret: process.env.NEXT_PUBLIC_KAKAO_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
};

export default NextAuth(authOptions);
