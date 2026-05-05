import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Campi mancanti" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password troppo corta (min 8 caratteri)" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email già registrata" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { email, name, passwordHash, role: "CUSTOMER" } });

  return NextResponse.json({ ok: true }, { status: 201 });
}
