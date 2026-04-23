import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        await dbConnect();
        
        const user = await User.findOne({ username: credentials.username });
        if (!user) return null;

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordCorrect) return null;

        const image =
          typeof user.imageUrl === "string" && user.imageUrl.length > 0
            ? user.imageUrl
            : null;

        return {
          id: user._id.toString(),
          name: user.username,
          role: user.role as "admin" | "voter",
          image: image ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        if (user.image) {
          token.image = user.image;
        } else {
          delete token.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        if (token.role === "admin" || token.role === "voter") {
          session.user.role = token.role;
        }
        if (token.image) {
          session.user.image = token.image as string;
        } else {
          session.user.image = null;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
});
