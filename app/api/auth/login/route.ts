// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { login } from "@/lib/api/services/auth.service"
import { ApiError } from "@/lib/api/client"

export async function POST(request: NextRequest) {
  try {
    const { email, password, type = "user" } = await request.json()
    const locale = request.headers.get("accept-language")?.split(",")[0] || "ar"

    const { user, tokens } = await login(email, password, type, locale)

    const mapRole = (u: unknown): "user" | "company" | "admin" => {
      const obj = u as Record<string, unknown> | undefined
      const rolesVal = obj?.roles
      if (Array.isArray(rolesVal)) {
        const rolesArr = rolesVal.map((r) => String(r).toLowerCase())
        if (rolesArr.includes("company")) return "company"
        if (rolesArr.includes("admin")) return "admin"
        if (rolesArr.includes("user")) return "user"
      }
      const roleStr = String(obj?.role ?? "").toLowerCase()
      if (roleStr.includes("company")) return "company"
      if (roleStr.includes("admin")) return "admin"
      if (roleStr.includes("user")) return "user"
      return "user"
    }

    const session = await getSession()
    session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: mapRole(user),
      avatar: user.avatar,
    }
    session.accessToken = tokens.access_token
    session.refreshToken = tokens.refresh_token
    session.isLoggedIn = true
    await session.save()

    return NextResponse.json({ user, tokens }, { status: 200 })
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
