import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export type AuthUser = {
  userId: string;
  username: string;
};

export function getAuthUser(request: NextRequest): AuthUser | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.substring(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const decoded = jwt.verify(token, secret) as any;
    if (!decoded?.userId || !decoded?.username) return null;
    return { userId: String(decoded.userId), username: String(decoded.username) };
  } catch {
    return null;
  }
}

export function requireAuthUser(request: NextRequest): AuthUser {
  const user = getAuthUser(request);
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
