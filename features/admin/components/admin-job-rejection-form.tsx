"use client"

import { useState, useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { rejectJobAction } from "@/features/admin/actions/admin-actions"

export function AdminJobRejectionForm({ jobId, locale }: { jobId: number; locale: string }) {
  const t = useTranslations("Admin.jobs")
  const router = useRouter()
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await rejectJobAction(jobId, locale, reason.trim() || undefined)
      if (!result.ok) {
        setError(result.message ?? t("error"))
        return
      }
      setReason("")
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm font-semibold text-[#111827]" htmlFor={`reject-reason-${jobId}`}>
        {t("reasonLabel")}
      </label>
      <textarea
        id={`reject-reason-${jobId}`}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        rows={4}
        placeholder={t("reasonPlaceholder")}
        className="w-full rounded-[12px] border border-[#DCEBFF] bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#40A0CA]"
      />
      {error ? <p className="text-sm text-[#B91C1C]">{error}</p> : null}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-[10px] bg-[#FEE2E2] px-4 py-2 text-sm font-semibold text-[#991B1B] transition hover:bg-[#FECACA] disabled:opacity-50"
        >
          {pending ? t("rejecting") : t("reject")}
        </button>
      </div>
    </form>
  )
}
