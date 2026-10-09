import dbConnect from "@/lib/db";
import { User } from "@/lib/models";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/api/response";

export async function GET() {
  return unauthorizedResponse();
}