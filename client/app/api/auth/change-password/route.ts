import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models";
import { badRequest, ok, serverError, unauthorized } from "@/lib/api/response";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Request body must be valid JSON");
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

  try {
    await connectToDatabase();
    const user = await User.findById(session.user.id).select("+password");
    if (!user) return unauthorized();

    const matches = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!matches) return badRequest("Current password is incorrect");

    user.password = await bcrypt.hash(parsed.data.newPassword, 12);
    await user.save();

    return ok({ message: "Password updated successfully" });
  } catch {
    return serverError();
  }
}
