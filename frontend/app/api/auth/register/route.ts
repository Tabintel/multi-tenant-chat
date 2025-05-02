import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Forward the registration request to the backend API
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }
  return NextResponse.json(data, { status: 201 });
}
