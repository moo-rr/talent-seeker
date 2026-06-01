// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { register } from "@/lib/api/services/auth.service"
import { ApiError } from "@/lib/api/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"

    const { user, tokens } = await register(
      {
        name: body.name,
        email: body.email,
        phone: body.phone,
        password: body.password,
        password_confirmation: body.password_confirmation,
        type: body.type === "company" ? "company" : "user",
        company_name: body.company_name,
        country_id: body.country_id ?? 1,
        accept_terms_and_privacy: body.accept_terms_and_privacy !== false,
      },
      locale
    )

    const session = await getSession()
    session.user = {
      id: Number(user.id),
      name: String(user.name || ""),
      email: String(user.email || ""),
      role: (String(user.role || body.type || "user").toLowerCase()) as "user" | "company" | "admin",
      avatar: user.avatar,
    }
    session.accessToken = tokens.access_token
    session.refreshToken = tokens.refresh_token
    session.locale = locale
    session.isLoggedIn = true
    
    await session.save()

    return NextResponse.json({ user }, { status: 201 })
  } catch (error: unknown) {
    const status = error instanceof ApiError ? error.status : 500
    const message = error instanceof ApiError ? error.message : "حدث خطأ في الخادم"
    const errors = error instanceof ApiError ? error.errors : undefined

    return NextResponse.json(
      { message, errors },
      { status }
    )
  }
}
