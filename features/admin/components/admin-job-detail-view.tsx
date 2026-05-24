import { ArrowLeft, Building2, CalendarDays, CircleDollarSign, MapPin, Users } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import type { Job } from "@/lib/api/types"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import { localizedField } from "@/features/company-jobs/lib/localized-field"
import { JobDetailHero } from "@/features/jobs/components/job-detail-hero"
import { DashboardStatusBadge } from "@/features/dashboard/components/dashboard-status-badge"
import { formatApplicationDeadline, formatJobSalaryRange, formatPostedLabel } from "@/features/jobs/lib/job-display"
import { pickLocalizedName } from "@/features/admin/lib/localized-name"
import { AdminJobQuickActions } from "@/features/admin/components/admin-job-quick-actions"
import { AdminJobRejectionForm } from "@/features/admin/components/admin-job-rejection-form"

function renderSectionBody(text: string) {
  const trimmed = text.trim()
  if (!trimmed) return null

  return trimmed.split(/\n{2,}/).map((paragraph, index) => (
    <p key={index} className="text-[16px] leading-[1.8] text-[#525252]">
      {paragraph.trim()}
    </p>
  ))
}

function MetadataItem({ icon: Icon, label, value }: { icon: typeof ArrowLeft; label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-[#E5E7EB] bg-white px-4 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-[#E8F2FF] p-2 text-[#006EA8]">
          <Icon className="size-4" />
        </span>
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#6B7280]">
            {label}
          </p>
          <p className="mt-1 text-[15px] font-semibold text-[#111827]">{value}</p>
        </div>
      </div>
    </div>
  )
}

export async function AdminJobDetailView({
  job,
  locale,
}: {
  job: Job
  locale: string
}) {
  const adminJobsT = await getTranslations("Admin.jobs")
  const jobsPageT = await getTranslations("Landing.jobsPage")

  const title = getJobTitle(job, locale)
  const description = localizedField(job.description, locale)
  const responsibilities = localizedField(job.responsibilities, locale)
  const requirements = localizedField(job.requirements, locale)
  const status = job.status === "approved" || job.status === "active" ? "approved" : job.status === "rejected" ? "rejected" : "pending"
  const salary = formatJobSalaryRange(job)
  const location = [job.state, job.city?.name, job.location].filter(Boolean).join(" • ")
  const postedLabel = formatPostedLabel(job, locale, jobsPageT("postedAgo"))
  const deadline = formatApplicationDeadline(job.application_deadline, locale)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Link
            href="/dashboard/admin/jobs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#006EA8]"
          >
            <ArrowLeft className="size-4" />
            {adminJobsT("backToJobs")}
          </Link>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#006EA8]">
              {adminJobsT("details")}
            </p>
            <h1 className="mt-2 text-[28px] font-bold text-[#111827] sm:text-[34px]">
              {title}
            </h1>
            <p className="mt-2 text-sm text-[#525252]">
              {job.company?.name ?? "—"}
              {job.category?.name ? ` • ${pickLocalizedName(job.category.name, locale)}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <DashboardStatusBadge status={status} label={adminJobsT(`status.${status}`)} />
          <AdminJobQuickActions jobId={job.id} locale={locale} status={job.status} showReject={false} />
        </div>
      </div>

      <div className="overflow-hidden rounded-[16px] bg-white shadow-[0_32px_64px_-12px_rgba(16,24,40,0.14)]">
        <JobDetailHero
          job={job}
          companyName={job.company?.name ?? "—"}
          industryFallback={pickLocalizedName(job.category?.name, locale) || "—"}
        />

        <div className="space-y-8 px-4 pb-10 pt-8 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="text-[16px] leading-[1.7] text-[#525252]">
                {job.company?.name ?? "—"}
                {job.category?.name ? ` • ${pickLocalizedName(job.category.name, locale)}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/dashboard/admin/jobs/${job.id}/applications`}
                className="rounded-[16px] border border-[#DCEBFF] bg-[#F6FBFF] px-4 py-3 text-right transition hover:border-[#40A0CA]"
              >
                <p className="text-[13px] text-[#6B7280]">{adminJobsT("applicationsLabel")}</p>
                <p className="mt-1 text-[24px] font-bold text-[#032C44]">{job.applications_count ?? 0}</p>
                <p className="mt-1 text-[13px] font-semibold text-[#006EA8]">{adminJobsT("viewApplications")}</p>
              </Link>
              <div className="rounded-[16px] border border-[#DCEBFF] bg-[#F6FBFF] px-4 py-3 text-right">
                <p className="text-[13px] text-[#6B7280]">{jobsPageT("detail.monthly")}</p>
                <p className="mt-1 text-[28px] font-bold text-[#032C44]">{salary}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetadataItem
              icon={Building2}
              label={adminJobsT("companyLabel")}
              value={job.company?.name ?? "—"}
            />
            <MetadataItem
              icon={MapPin}
              label={adminJobsT("locationLabel")}
              value={location || "—"}
            />
            <MetadataItem
              icon={CalendarDays}
              label={adminJobsT("postedOnLabel")}
              value={postedLabel}
            />
            <MetadataItem
              icon={CircleDollarSign}
              label={adminJobsT("deadlineLabel")}
              value={deadline}
            />
            <MetadataItem
              icon={Users}
              label={adminJobsT("applicationsLabel")}
              value={String(job.applications_count ?? 0)}
            />
          </div>

          {status === "pending" ? (
            <section className="rounded-[16px] border border-[#EEF2F7] bg-[#FAFBFC] p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-[20px] font-bold text-[#111827]">{adminJobsT("rejectReasonTitle")}</h2>
                  <p className="mt-2 text-sm text-[#525252]">{adminJobsT("rejectReasonHint")}</p>
                </div>
              </div>
              <div className="mt-4">
                <AdminJobRejectionForm jobId={job.id} locale={locale} />
              </div>
            </section>
          ) : null}

          {description ? (
            <section className="space-y-4 rounded-[16px] border border-[#EEF2F7] bg-[#FAFBFC] p-6">
              <h2 className="text-[20px] font-bold text-[#111827]">{jobsPageT("description")}</h2>
              <div className="space-y-4">{renderSectionBody(description)}</div>
            </section>
          ) : null}

          {responsibilities ? (
            <section className="space-y-4 rounded-[16px] border border-[#EEF2F7] bg-[#FAFBFC] p-6">
              <h2 className="text-[20px] font-bold text-[#111827]">{jobsPageT("responsibilities")}</h2>
              <div className="space-y-4">{renderSectionBody(responsibilities)}</div>
            </section>
          ) : null}

          {requirements ? (
            <section className="space-y-4 rounded-[16px] border border-[#EEF2F7] bg-[#FAFBFC] p-6">
              <h2 className="text-[20px] font-bold text-[#111827]">{jobsPageT("requirements")}</h2>
              <div className="space-y-4">{renderSectionBody(requirements)}</div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )
}
