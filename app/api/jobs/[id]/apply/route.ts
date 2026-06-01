import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { api } from "@/lib/api/client"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    const token = session.accessToken

    if (!token) {
      return NextResponse.json({ ok: false, message: "Unauthenticated" }, { status: 401 })
    }

    const locale = request.headers.get("x-locale") || request.headers.get("accept-language") || "ar"
    const jobId = params.id

    // If an external jobs API base is configured, prefer forwarding the request there.
    const externalBase = process.env.JOBS_API_URL || process.env.NEXT_PUBLIC_JOBS_API_URL || process.env.NEXT_PUBLIC_API_URL

    if (externalBase) {
      try {
        const url = `${externalBase.replace(/\/$/, "")}/jobs/${jobId}/apply`
        const headers: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          "Accept-Language": locale,
        }

        // forward any body if present
        const bodyText = await request.text().catch(() => "")
        const res = await fetch(url, {
          method: "POST",
          headers,
          body: bodyText ? bodyText : undefined,
        })

        const payload = await res.json().catch(() => ({ ok: res.ok }))
        return NextResponse.json(payload, { status: res.status })
      } catch (err) {
        console.error("[api/jobs/[id]/apply] external forward error:", err)
        // fallthrough to internal client as a fallback
      }
    }

    // Fallback: use internal API client
    const response = await api.post(`/jobs/${jobId}/apply`, {}, { token, locale })
    return NextResponse.json(response)
  } catch (error: any) {
    console.error("[api/jobs/[id]/apply] error:", error)
    const status = error?.status && typeof error.status === "number" ? error.status : 500
    const message = error?.message || "Failed to apply"
    return NextResponse.json({ ok: false, message }, { status })
  }
}
