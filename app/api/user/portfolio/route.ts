import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getUserPortfolio } from "@/lib/api/services/portfolio.service"
import { ApiError } from "@/lib/api/client"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    const token = session.accessToken
    if (!token) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })

    const locale = request.headers.get("accept-language")?.split(",")[0] || session.locale || "ar"
    const portfolio = await getUserPortfolio(token, locale)
    return NextResponse.json(portfolio)
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 500
    const message = error instanceof Error ? error.message : "Failed to load portfolio"
    return NextResponse.json({ message }, { status })
  }
}
