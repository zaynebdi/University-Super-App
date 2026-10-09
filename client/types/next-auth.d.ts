import "next-auth";
import "@auth/core/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    role: "student" | "teacher" | "admin";
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "student" | "teacher" | "admin";
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: "student" | "teacher" | "admin";
  }
}