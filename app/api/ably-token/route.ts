import { NextResponse } from "next/server";
import * as Ably from "ably";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY! });
  const tokenRequest = await ably.auth.createTokenRequest({
    clientId: session.user.id,
  });

  return NextResponse.json(tokenRequest);
}
