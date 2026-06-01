import { NextRequest, NextResponse } from "next/server"
import { getCountries } from "@/lib/api/services/auth.service"
import { getSession } from "@/lib/session"

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") || "ar"
  const session = await getSession().catch(() => null)

  try {
    const list = await getCountries(locale, session?.accessToken)
    return NextResponse.json({ data: list })
  } catch {
    return NextResponse.json({ data: [], error: "Failed to fetch countries" }, { status: 500 })
  }
}
