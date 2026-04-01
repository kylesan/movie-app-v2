import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const tokenResponse = await fetch(
    `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.AUTH0_BASE_URL}/auth/callback`,
      }),
    }
  );

  const tokens = await tokenResponse.json();

  if (!tokens.access_token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const userResponse = await fetch(
    `https://${process.env.AUTH0_DOMAIN}/userinfo`,
    {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    }
  );
  const user = await userResponse.json();

  const response = NextResponse.redirect(new URL("/", request.url));
  
  response.cookies.set("access_token", tokens.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: tokens.expires_in,
    path: "/",
  });

  response.cookies.set("user", JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: tokens.expires_in,
    path: "/",
  });

  return response;
}