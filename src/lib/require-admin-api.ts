import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";

// API-route counterpart of requireAdmin(): returns an error response to send back,
// or null when the caller is a signed-in ADMIN. Customers have sessions too, so
// checking for a session alone is not enough.
export async function requireAdminApi() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}
