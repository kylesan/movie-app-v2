import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  
  console.log("All movies - token exists:", !!token);
  
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${API_URL}/api/movies/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const text = await res.text();
  console.log("All movies - Spring Boot status:", res.status);
  console.log("All movies - Spring Boot body:", text);
  
  if (!text) return NextResponse.json([]);
  return NextResponse.json(JSON.parse(text));
}