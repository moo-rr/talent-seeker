import { NextRequest, NextResponse } from "next/server"
import { getCities } from "@/lib/api/services/auth.service"
import { getSession } from "@/lib/session"

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") || "ar"
  const countryIdStr = request.nextUrl.searchParams.get("countryId")
  if (!countryIdStr) {
    return NextResponse.json({ data: [], message: "Missing countryId" }, { status: 400 })
  }

  const countryId = Number(countryIdStr)
  const session = await getSession().catch(() => null)

  try {
    const list = await getCities(countryId, locale, session?.accessToken)
    return NextResponse.json({ data: list })
  } catch {
    return NextResponse.json({ data: [], error: "Failed to fetch cities" }, { status: 500 })
  }
}
