import { NextResponse } from "next/server";

export async function GET() {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.AUTH0_CLIENT_ID!,
    redirect_uri: `${process.env.AUTH0_BASE_URL}/auth/callback`,
    scope: "openid profile email",
    audience: process.env.AUTH0_AUDIENCE!,
  });

  return NextResponse.redirect(
    `https://${process.env.AUTH0_DOMAIN}/authorize?${params.toString()}`
  );
}