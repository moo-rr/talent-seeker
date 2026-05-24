"use client"

import { useMemo, useState, useTransition } from "react"
import { Link, useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import type { Job } from "@/lib/api/types"
import { getJobTitle } from "@/features/company-jobs/lib/job-title"
import { pickLocalizedName } from "@/features/admin/lib/localized-name"
import { DashboardStatusBadge } from "@/features/dashboard/components/dashboard-status-badge"
import { approveJobAction, rejectJobAction } from "@/features/admin/actions/admin-actions"
import { AdminTableCell, AdminTableRow, AdminTableShell } from "./admin-table-shell"
import { cn } from "@/lib/utils"

type Tab = "pending" | "approved" | "rejected" | "all"

function mapStatus(status: string): "pending" | "approved" | "rejected" {
  if (status === "approved" || status === "active") return "approved"
  if (status === "rejected") return "rejected"
  return "pending"
}

export function AdminJobsPanel({
  jobs,
  locale,
  initialTab = "pending",
}: {
  jobs: Job[]
  locale: string
  initialTab?: Tab
}) {
  const t = useTranslations("Admin.jobs")
  const router = useRouter()
  const [tab, setTab] = useState<Tab>(initialTab)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (tab === "all") return jobs
    return jobs.filter((j) => mapStatus(j.status) === tab)
  }, [jobs, tab])

  const statusCounts = useMemo(() => {
    return {
      total: jobs.length,
      pending: jobs.filter((job) => mapStatus(job.status) === "pending").length,
      approved: jobs.filter((job) => mapStatus(job.status) === "approved").length,
      rejected: jobs.filter((job) => mapStatus(job.status) === "rejected").length,
    }
  }, [jobs])

  const tabs: { id: Tab; label: string }[] = [
    { id: "pending", label: t("tabs.pending") },
    { id: "approved", label: t("tabs.approved") },
    { id: "rejected", label: t("tabs.rejected") },
    { id: "all", label: t("tabs.all") },
  ]

  const columns = [
    { key: "title", label: t("columns.title"), className: "w-[24%]" },
    { key: "company", label: t("columns.company"), className: "w-[18%]" },
    { key: "category", label: t("columns.category"), className: "w-[14%]" },
    { key: "salary", label: t("columns.salary"), className: "w-[14%]" },
    { key: "status", label: t("columns.status"), className: "w-[12%]" },
    { key: "actions", label: t("columns.actions"), className: "w-[18%]" },
  ]

  const statusLabels: Record<string, string> = {
    pending: t("status.pending"),
    approved: t("status.approved"),
    rejected: t("status.rejected"),
  }

  const summaryCards = [
    { key: "total", label: t("summary.total"), value: statusCounts.total },
    { key: "pending", label: t("summary.pending"), value: statusCounts.pending },
    { key: "approved", label: t("summary.published"), value: statusCounts.approved },
    { key: "rejected", label: t("summary.rejected"), value: statusCounts.rejected },
  ]

  function runAction(action: () => Promise<{ ok: boolean; message?: string }>) {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (!result.ok) {
        setError(result.message ?? t("error"))
        return
      }
      router.refresh()
    })
  }

  function handleTabChange(nextTab: Tab) {
    setTab(nextTab)
    router.push(`/dashboard/admin/jobs?status=${nextTab}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.key}
            className="rounded-[16px] border border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_12px_32px_-18px_rgba(16,24,40,0.28)]"
          >
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
              {card.label}
            </p>
            <p className="mt-3 text-[28px] font-black text-[#111827]">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleTabChange(item.id)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              tab === item.id
                ? "bg-gradient-to-l from-[#032C44] to-[#41A0CA] text-white"
                : "border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</p>
      )}

      <AdminTableShell columns={columns} isEmpty={filtered.length === 0} emptyMessage={t("empty")}>
        {filtered.map((job, index) => {
          const status = mapStatus(job.status)
          const salary =
            job.salary_from != null && job.salary_to != null
              ? `€${job.salary_from} – €${job.salary_to}`
              : "—"

          return (
            <AdminTableRow key={job.id} striped={index % 2 === 1}>
              <AdminTableCell className="w-[24%] font-medium">{getJobTitle(job, locale)}</AdminTableCell>
              <AdminTableCell className="w-[18%]">{job.company?.name ?? "—"}</AdminTableCell>
              <AdminTableCell className="w-[14%]">
                {pickLocalizedName(job.category?.name, locale)}
              </AdminTableCell>
              <AdminTableCell className="w-[14%]">{salary}</AdminTableCell>
              <AdminTableCell className="w-[12%]">
                <DashboardStatusBadge status={status} label={statusLabels[status]} />
              </AdminTableCell>
              <AdminTableCell className="w-[18%]">
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/admin/jobs/${job.id}`}
                    className="rounded-lg border border-[#DCEBFF] bg-[#F6FBFF] px-3 py-1.5 text-xs font-semibold text-[#006EA8] hover:bg-[#EAF6FF]"
                  >
                    {t("viewDetails")}
                  </Link>
                  {status === "pending" ? (
                    <>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => runAction(() => approveJobAction(job.id, locale))}
                        className="rounded-lg bg-[#D1FAE5] px-3 py-1.5 text-xs font-semibold text-[#065F46] hover:bg-[#A7F3D0] disabled:opacity-50"
                      >
                        {t("approve")}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => runAction(() => rejectJobAction(job.id, locale))}
                        className="rounded-lg bg-[#FEE2E2] px-3 py-1.5 text-xs font-semibold text-[#991B1B] hover:bg-[#FECACA] disabled:opacity-50"
                      >
                        {t("reject")}
                      </button>
                    </>
                  ) : null}
                </div>
              </AdminTableCell>
            </AdminTableRow>
          )
        })}
      </AdminTableShell>
    </div>
  )
}
