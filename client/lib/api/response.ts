import { NextResponse } from "next/server";

export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = { success: false; message: string; errors?: unknown };

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data }, { status });
}

export function created<T>(data: T) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data }, { status: 201 });
}

export function fail(message: string, status = 400, errors?: unknown) {
  return NextResponse.json<ApiError>(
    { success: false, message, ...(errors === undefined ? {} : { errors }) },
    { status },
  );
}

export const badRequest = (message = "Invalid request", errors?: unknown) =>
  fail(message, 400, errors);
export const unauthorized = (message = "Unauthorized") => fail(message, 401);
export const forbidden = (message = "Forbidden") => fail(message, 403);
export const notFound = (message = "Not found") => fail(message, 404);
export const conflict = (message = "Already exists") => fail(message, 409);
export const serverError = (message = "Internal server error") => fail(message, 500);
