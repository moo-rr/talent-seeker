import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { uploadCV } from "@/lib/api/services/portfolio.service"
import { ApiError } from "@/lib/api/client"

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const token = session.accessToken
    if (!token) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get("cv") as File | null
    if (!file) return NextResponse.json({ message: "No file provided" }, { status: 400 })

    const locale = request.headers.get("accept-language")?.split(",")[0] || session.locale || "ar"
    const result = await uploadCV(file as any, token, locale)
    return NextResponse.json(result)
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 500
    const message = error instanceof Error ? error.message : "Failed to upload CV"
    return NextResponse.json({ message }, { status })
  }
}
