import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getNotifications } from "@/lib/api/services/notifications.service"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const token = session.accessToken
    if (!token) {
      return NextResponse.json({ data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 } })
    }

    const page = Number(request.nextUrl.searchParams.get("page") || "1")
    const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"
    const result = await getNotifications(token, page, locale as "ar" | "en" | "de")
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 } })
  }
}
