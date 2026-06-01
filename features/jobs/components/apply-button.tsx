"use client"

import * as React from "react"
import { toast } from "sonner"
import { PrimaryButton } from "@/components/ui/primary-button"

type ApplyButtonProps = {
  jobId: number
  locale?: string
  label?: string
}

export default function ApplyButton({ jobId, locale = "ar", label = "Apply" }: ApplyButtonProps) {

  const [applied, setApplied] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const handleApply = async () => {
    if (loading || applied) return
    setLoading(true)
    const id = toast.loading("Processing...")
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "x-locale": locale },
      })

      if (res.status === 401) {
        toast.dismiss(id)
        // redirect to sign-in preserving locale
        window.location.href = `/${locale}/sign-in`
        return
      }

      const data = await res.json().catch(() => null)

      // Successful apply
      if (res.ok && data && (data.ok || data.applied || data.already === true)) {
        setApplied(true)
        toast.dismiss(id)
        toast.success(data?.message || "Applied")
        return
      }

      // Backend may return 409 or a message indicating the user already applied
      if (res.status === 409 || (data && typeof data.message === "string" && /already/i.test(data.message))) {
        setApplied(true)
        toast.dismiss(id)
        toast(() => data?.message || "Already applied")
        return
      }

      throw new Error((data && data.message) || "Failed to apply")
    } catch (err: any) {
      setApplied(false)
      toast.dismiss(id)
      toast.error(err?.message || "Failed to apply")
      console.error("Apply error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleApply}
      disabled={loading || applied}
      className={`mt-8 h-[44px] w-full rounded-[12px] text-[16px] font-medium ${applied ? "bg-gray-300 text-gray-700" : "bg-gradient-to-br from-[#006EA8] to-[#005685] text-white"}`}
    >
      {applied ? "Applied" : label}
    </button>
  )
}
