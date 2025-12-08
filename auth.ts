import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "./src/app/models/User";
import dbConnect from "./src/app/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },

      async authorize(credentials) {
        await dbConnect();

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha obrigatorios");
        }

        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("Usuario nao encontrado");
        }

        const valid = await user.checkPassword(credentials.password);
        if (!valid) {
          throw new Error("Senha incorreta");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          username: user.username || user.email,
          type: user.type,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Novo login
      if (user) {
        token.id = user.id;
        token.type = user.type!;
        token.username = user.username!;
        token.email = user.email!;
        token.name = user.name!;
      }

      // Atualizacao via useSession().update
      if (trigger === "update" && session) {
        token.name = session.name ?? token.name;
        token.email = session.email ?? token.email;
        token.username = session.username ?? token.username;
      }

      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          type: token.type as string,
          username: token.username as string,
          email: token.email as string,
          name: token.name as string,
        },
      };
    },
  },

  pages: {
    signIn: "/login",
  },
});
