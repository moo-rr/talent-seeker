"use client"

import { useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import { CheckCircle, XCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { approveJobAction, rejectJobAction } from "@/features/admin/actions/admin-actions"

export function AdminJobQuickActions({
  jobId,
  locale,
  status,
  showReject = true,
}: {
  jobId: number
  locale: string
  status?: string
  showReject?: boolean
}) {
  const t = useTranslations("Admin.jobs")
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function run(fn: () => Promise<{ ok: boolean }>) {
    startTransition(async () => {
      await fn()
      router.refresh()
    })
  }

  if (status && status !== "pending") {
    return <span className="text-xs text-[#9CA3AF]">—</span>
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => approveJobAction(jobId, locale))}
        className="inline-flex items-center gap-1 rounded-[8px] bg-[#D1FAE5] px-3 py-1.5 text-[12px] font-semibold text-[#065F46] hover:bg-[#A7F3D0] disabled:opacity-50"
      >
        <CheckCircle size={13} />
        {t("approve")}
      </button>
      {showReject ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => rejectJobAction(jobId, locale))}
          className="inline-flex items-center gap-1 rounded-[8px] bg-[#FEE2E2] px-3 py-1.5 text-[12px] font-semibold text-[#991B1B] hover:bg-[#FECACA] disabled:opacity-50"
        >
          <XCircle size={13} />
          {t("reject")}
        </button>
      ) : null}
    </div>
  )
}
