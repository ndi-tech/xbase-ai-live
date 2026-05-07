import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "API is working!", timestamp: new Date().toISOString() });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: "POST request received", status: "ok" });
}
