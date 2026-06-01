import { NextRequest, NextResponse } from "next/server"
import { getCompanyTypes } from "@/lib/api/services/auth.service"
import { getSession } from "@/lib/session"

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") || "ar"
  const session = await getSession().catch(() => null)

  try {
    const list = await getCompanyTypes(locale, session?.accessToken)
    return NextResponse.json({ data: list })
  } catch {
    return NextResponse.json({ data: [], error: "Failed to fetch company types" }, { status: 500 })
  }
}
