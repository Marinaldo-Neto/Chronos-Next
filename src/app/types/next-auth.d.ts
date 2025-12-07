import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    type: string;
    username: string;
    email: string;
  }

  interface Session {
    user: {
      id: string;
      type: string;
      username: string;
      email: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    type: string;
    username: string;
  }
}
