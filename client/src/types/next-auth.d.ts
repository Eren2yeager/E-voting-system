import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: "admin" | "voter";
  }

  interface Session {
    user: {
      id: string;
      role?: "admin" | "voter";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "admin" | "voter";
    image?: string;
  }
}
