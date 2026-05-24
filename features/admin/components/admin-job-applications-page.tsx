import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { getCompanyJob, getJobApplications } from "@/lib/api/services/company.service"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import { DashboardStatusBadge } from "@/features/dashboard/components/dashboard-status-badge"
import { cn } from "@/lib/utils"

function mapStatus(status: string): "pending" | "accepted" | "rejected" {
  if (status === "accepted") return "accepted"
  if (status === "rejected") return "rejected"
  return "pending"
}

function formatAppliedAt(value?: string) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export async function AdminJobApplicationsPage({
  jobId,
  locale,
  accessToken,
}: {
  jobId: number
  locale: string
  accessToken: string
}) {
  const t = await getTranslations("Admin.jobs")
  const job = await getCompanyJob(jobId, accessToken, locale)

  if (!job) {
    notFound()
  }

  const { data: applications } = await getJobApplications(jobId, accessToken, 1, locale)
  const title = getJobTitle(job, locale)
  const statusLabels: Record<string, string> = {
    pending: t("applicationsPage.status.pending"),
    accepted: t("applicationsPage.status.accepted"),
    rejected: t("applicationsPage.status.rejected"),
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href={`/dashboard/admin/jobs/${jobId}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#006EA8]"
          >
            ← {t("applicationsPage.backToDetail")}
          </Link>
          <h1 className="mt-3 text-[26px] font-bold text-[#111827] sm:text-[30px]">
            {t("applicationsPage.title")}
          </h1>
          <p className="mt-2 text-sm text-[#525252]">{title}</p>
        </div>
        <Link
          href="/dashboard/admin/jobs"
          className="rounded-[10px] border border-[#DCEBFF] bg-white px-4 py-2 text-sm font-semibold text-[#006EA8]"
        >
          {t("applicationsPage.backToJobs")}
        </Link>
      </div>

      <div className="overflow-hidden rounded-[16px] bg-white shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)]">
        <div className="border-b border-[#F0F4F8] bg-gradient-to-l from-[#032C44] to-[#41A0CA] px-4 py-4 text-white">
          <p className="text-sm font-semibold">{t("applicationsPage.summary")}</p>
          <p className="mt-2 text-[24px] font-bold">{applications.length}</p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="flex items-center bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-[#374151]">
              <div className="w-[30%]">{t("applicationsPage.candidate")}</div>
              <div className="w-[20%] text-center">{t("applicationsPage.statusLabel")}</div>
              <div className="w-[25%]">{t("applicationsPage.appliedAt")}</div>
              <div className="flex-1 text-left">{t("applicationsPage.email")}</div>
            </div>

            {applications.length === 0 ? (
              <p className="px-4 py-12 text-center text-sm text-[#525252]">
                {t("applicationsPage.empty")}
              </p>
            ) : (
              applications.map((application, index) => {
                const appStatus = mapStatus(application.status)
                return (
                  <div
                    key={application.id}
                    className={cn(
                      "flex items-center border-b border-[#F0F4F8] last:border-0",
                      index % 2 === 0 ? "bg-white" : "bg-[#F9FBFD]"
                    )}
                  >
                    <div className="w-[30%] px-4 py-4 text-sm font-semibold text-[#111827]">
                      {application.user?.name ?? t("applicationsPage.unknownCandidate")}
                    </div>
                    <div className="w-[20%] px-4 py-4 text-center">
                      <DashboardStatusBadge status={appStatus} label={statusLabels[appStatus]} />
                    </div>
                    <div className="w-[25%] px-4 py-4 text-sm text-[#4B5563]">
                      {formatAppliedAt(application.applied_at)}
                    </div>
                    <div className="flex-1 px-4 py-4 text-sm text-[#4B5563]">
                      {application.user?.email ?? "—"}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
