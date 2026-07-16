import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

const isDev = process.env.NODE_ENV === "development" || process.env.DEV_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google,
    GitHub,
    ...(isDev
      ? [
          Credentials({
            id: "dev",
            name: "Dev Login",
            credentials: {
              code: { label: "Dev Code", type: "password" },
            },
            async authorize(credentials) {
              const code = credentials?.code as string | undefined;
              const validCode = process.env.DEV_SECRET || "dev-login-2024";
              if (code === validCode) {
                return {
                  id: "dev-user",
                  email: process.env.DEV_EMAIL || "dev@ideforge.app",
                  name: process.env.DEV_NAME || "Dev User",
                };
              }
              return null;
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});
