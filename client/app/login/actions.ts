"use server";

import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { resolveLoginRedirect } from "@/lib/auth-redirect";

export async function login(_prevState: unknown, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password" };
        default:
          return { success: false, error: "Something went wrong" };
      }
    }
    throw error;
  }

  const session = await auth();
  const rawCallbackUrl = formData.get("callbackUrl");
  const callbackUrl = typeof rawCallbackUrl === "string" ? rawCallbackUrl : undefined;

  redirect(resolveLoginRedirect(session?.user?.role, callbackUrl));
}