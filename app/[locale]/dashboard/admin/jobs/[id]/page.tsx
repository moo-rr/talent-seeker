import { notFound, redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getCompanyJob } from "@/lib/api/services/company.service"
import { AdminJobDetailView } from "@/features/admin/components/admin-job-detail-view"

export default async function AdminJobDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const jobId = Number(id)

  if (!Number.isFinite(jobId) || jobId <= 0) {
    redirect(`/${locale}/dashboard/admin/jobs`)
  }

  const session = await getSession()

  if (!session.user || session.user.role !== "admin" || !session.accessToken) {
    redirect(`/${locale}/dashboard`)
  }

  const job = await getCompanyJob(jobId, session.accessToken, locale)

  if (!job) {
    notFound()
  }

  return <AdminJobDetailView job={job} locale={locale} />
}
