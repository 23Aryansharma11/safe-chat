import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

import { redis } from "./lib/redis";

export const proxy = async (req: NextRequest) => {
  const pathname = req.nextUrl.pathname;

  const roomMatch = pathname.match(/^\/room\/([^/]+)$/);

  if (!roomMatch)
    return NextResponse.redirect(new URL("/?error=invalid-url", req.url));

  const roomId = roomMatch[1];

  const meta = await redis.hgetall<{ connected: string[]; createdAt: number }>(
    `meta:${roomId}`,
  );

  if (!meta)
    return NextResponse.redirect(new URL("/?error=room-not-found", req.url));

  const authToken = req.cookies.get("x-auth-token")?.value;
  console.log(meta.connected);
  console.log(authToken);
  if (authToken && meta.connected.includes(authToken)) {
    // let user join
    return NextResponse.next();
  }

  if (meta.connected.length >= 2) {
    return NextResponse.redirect(new URL("/?error=room-full", req.url));
  }

  const response = NextResponse.next();

  const token = nanoid();

  response.cookies.set("x-auth-token", token, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  // add user to redis
  await redis.hset(`meta:${roomId}`, {
    connected: [...meta.connected, token],
  });

  return response;
};

export const config = {
  matcher: "/room/:path*",
};
