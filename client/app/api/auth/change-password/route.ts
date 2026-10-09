import { auth } from "@/lib/auth-server";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/api/response";
import bcrypt from "bcryptjs";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  const body = await req.json();
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Invalid input", 400);

  await dbConnect();
  const user = await User.findById((session.user as { id?: string }).id).select("+password");
  if (!user) return errorResponse("User not found", 404);

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!valid) return forbiddenResponse("Current password is incorrect");

  user.password = await bcrypt.hash(parsed.data.newPassword, 12);
  await user.save();

  return successResponse({ message: "Password changed successfully" });
}