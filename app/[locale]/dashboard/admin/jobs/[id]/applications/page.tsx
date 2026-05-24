import { notFound, redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { AdminJobApplicationsPage } from "@/features/admin/components/admin-job-applications-page"

export default async function AdminJobApplicationsRoutePage({
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

  if (!session.accessToken) {
    notFound()
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <AdminJobApplicationsPage jobId={jobId} locale={locale} accessToken={session.accessToken} />
    </div>
  )
}
