import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

export const authConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = z
          .object({ email: z.email(), password: z.string().min(8) })
          .safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const { default: dbConnect } = await import("@/lib/db");
        const { User } = await import("@/lib/models");

        await dbConnect();
        const user = await User.findOne({ email }).select("+password");
        if (!user || !user.isActive) return null;

        const bcrypt = (await import("bcryptjs")).default;
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" } as const,
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: { id: string; role: "student" | "teacher" | "admin" } }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "student" | "teacher" | "admin";
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
};