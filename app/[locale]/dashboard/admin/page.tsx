import { redirect } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { ApiError } from "@/lib/api/client"
import { getAdminJobs, getAdminUsers, getAdminStats } from "@/lib/api/services/admin.service"
import { AdminDashboardOverview } from "@/features/admin/components/admin-dashboard-overview"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

const EMPTY_META = { current_page: 1, last_page: 1, per_page: 10, total: 0 } as const

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()
  const t = await getTranslations("admin")

  if (!session.isLoggedIn || !session.user || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  if (session.user.role !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  let token = session.accessToken
  let stats = {
    total_users: 0,
    total_companies: 0,
    total_jobs: 0,
    pending_jobs: 0,
    published_jobs: 0,
  }
  let pendingJobs: Awaited<ReturnType<typeof getAdminJobs>>["data"] = []

  async function fetchAll(tkn: string) {
    // Use dedicated stats endpoint (with robust fallbacks) to get accurate totals.
    const statsRes = await getAdminStats(tkn, locale).catch(() => ({ total_users: 0, total_companies: 0, total_jobs: 0, pending_jobs: 0 }))
    const pendingRes = await getAdminJobs(tkn, "pending", 1, locale).catch(() => ({ data: [], meta: { ...EMPTY_META } }))

    stats = {
      total_users: statsRes.total_users ?? 0,
      total_companies: statsRes.total_companies ?? 0,
      total_jobs: statsRes.total_jobs ?? 0,
      pending_jobs: statsRes.pending_jobs ?? (pendingRes.meta?.total ?? 0),
      published_jobs: (statsRes.total_jobs ?? 0) - (statsRes.pending_jobs ?? 0),
    }
    pendingJobs = pendingRes.data
  }

  try {
    if (token) {
      await fetchAll(token)
    } else {
      redirect(`/${locale}/sign-in`)
    }
  } catch (err) {
    console.error("[AdminDashboardPage] error during fetch:", err)
    if (err instanceof ApiError && err.status === 401 && session.refreshToken) {
      try {
        console.log("[AdminDashboardPage] Access token expired, attempting to refresh token...")
        const { refreshToken: refreshService } = await import("@/lib/api/services/auth.service")
        const tokens = await refreshService(session.refreshToken, locale)

        session.accessToken = tokens.access_token
        session.refreshToken = tokens.refresh_token
        await session.save()

        await fetchAll(tokens.access_token)
      } catch (refreshErr) {
        console.error("[AdminDashboardPage] Token refresh failed:", refreshErr)
        redirect(`/${locale}/sign-in`)
      }
    } else {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        redirect(`/${locale}/sign-in`)
      }
      stats = {
        total_users: 0,
        total_companies: 0,
        total_jobs: 0,
        pending_jobs: 0,
        published_jobs: 0,
      }
      pendingJobs = []
    }
  }

  return (
    <AdminPageLayout title={t("title")} description={t("description")}>
      <AdminDashboardOverview stats={stats} pendingJobs={pendingJobs} locale={locale} />
    </AdminPageLayout>
  )
}
