import { NextRequest, NextResponse } from "next/server"
import { getCategoriesForForm } from "@/lib/api/services/categories.service"
import { getSession } from "@/lib/session"

export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get("locale")
  const locale =
    localeParam ||
    request.headers.get("accept-language")?.split(",")[0]?.slice(0, 2) ||
    "ar"

  const session = await getSession().catch(() => null)

  try {
    const categories = await getCategoriesForForm(
      locale,
      session?.accessToken ?? undefined
    )
    return NextResponse.json({ data: categories })
  } catch {
    return NextResponse.json({ data: [] })
  }
}
