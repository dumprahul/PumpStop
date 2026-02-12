import { NextResponse } from "next/server"
import { CUSTOM_PRICE_ADDRESS } from "@/lib/custom-tokens"

export async function GET() {
  try {
    const res = await fetch(
      `https://robinpump.fun/api/prices/${CUSTOM_PRICE_ADDRESS}`,
      { cache: "no-store" }
    )

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch custom token prices" },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    )
  }
}
