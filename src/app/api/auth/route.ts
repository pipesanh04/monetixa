import { NextResponse } from "next/server";
import { AUTH_COOKIE, isValidSerial } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const serial = String(body?.serial ?? "").trim();

    if (!serial) {
      return NextResponse.json(
        { ok: false, error: "Ingresa un serial válido." },
        { status: 400 },
      );
    }

    if (!isValidSerial(serial)) {
      return NextResponse.json(
        { ok: false, error: "Serial no autorizado." },
        { status: 401 },
      );
    }

    const res = NextResponse.json({ ok: true, serial });
    res.cookies.set(AUTH_COOKIE, serial, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Solicitud inválida." },
      { status: 400 },
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}

export async function GET() {
  const { getSessionSerial } = await import("@/lib/auth");
  const serial = await getSessionSerial();
  if (!serial) {
    return NextResponse.json({ ok: false, authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true, authenticated: true, serial });
}
