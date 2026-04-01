import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const year = request.nextUrl.searchParams.get("year");
  const res = await fetch(`${API_URL}/api/movies?year=${year}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log("Token exists:", !!token);
  console.log("Spring Boot response status:", res.status);
  const text = await res.text();
  console.log("Spring Boot response body:", text);
  if (!text) return NextResponse.json([]);
  return NextResponse.json(JSON.parse(text));
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  
  const res = await fetch(`${API_URL}/api/movies`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  console.log("Body being sent to Spring Boot:", JSON.stringify(body));

  const text = await res.text();
  if (!text) return NextResponse.json({});
  return NextResponse.json(JSON.parse(text));
}