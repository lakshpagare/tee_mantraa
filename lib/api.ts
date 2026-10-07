import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { isAdminRole } from "@/lib/constants";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const ok = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const fail = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

/** Wrap a handler: converts thrown errors into safe JSON (no raw technical messages). */
export function handler<A extends any[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (e: any) {
      if (e instanceof ApiError) return fail(e.message, e.status);
      if (e instanceof ZodError) return fail(e.issues[0]?.message || "Invalid input", 422);
      if (e?.code === 11000) return fail("A record with the same unique value already exists", 409);
      console.error("[api]", e);
      return fail("Something went wrong. Please try again.", 500);
    }
  };
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new ApiError(401, "Please sign in to continue");
  return session.user;
}

/** Server-side admin check. Never rely on client-side checks alone. */
export async function requireAdmin() {
  const user = await requireUser();
  if (!isAdminRole(user.role)) throw new ApiError(403, "Forbidden");
  return user;
}

export async function parseBody<T>(req: Request, schema: { parse: (v: unknown) => T }): Promise<T> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new ApiError(400, "Invalid request body");
  }
  return schema.parse(json);
}
