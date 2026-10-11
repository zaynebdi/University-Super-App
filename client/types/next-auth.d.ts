import "next-auth";
import "@auth/core/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    role: "student" | "teacher" | "admin";
    assignedDepartment?: string | null;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "student" | "teacher" | "admin";
      assignedDepartment?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: "student" | "teacher" | "admin";
    assignedDepartment?: string | null;
  }
}