import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const uuid = request.nextUrl.searchParams.get("uuid");
    if (!uuid) {
      return NextResponse.json({ error: "Missing uuid parameter" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "src", "lib", "mock_blockchain_state.json");
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const state = JSON.parse(content);
      const record = state[uuid];
      if (record) {
        return NextResponse.json({ success: true, record });
      }
    }

    // Default mock response if not found
    return NextResponse.json({
      success: true,
      record: {
        hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
        isRevoked: false,
        revocationReason: "",
        issuerWallet: "0x0000000000000000000000000000000000000000",
        blockTimestamp: 0
      }
    });
  } catch (error: any) {
    console.error("Mock blockchain state API failed:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
