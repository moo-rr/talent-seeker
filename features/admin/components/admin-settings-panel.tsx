"use client"

import { useState, useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import type { SiteSetting } from "@/lib/api/services/settings.service"
import { saveSettingAction } from "@/features/admin/actions/admin-actions"
import { PrimaryButton } from "@/components/ui/primary-button"

function settingDisplayValue(value: SiteSetting["value"]): string {
  if (typeof value === "string") return value
  if (typeof value === "object" && value) return JSON.stringify(value, null, 2)
  return String(value ?? "")
}

export function AdminSettingsPanel({
  settings,
  locale,
}: {
  settings: SiteSetting[]
  locale: string
}) {
  const t = useTranslations("Admin.settings")
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [settingValue, setSettingValue] = useState("")

  function saveSetting(key: string) {
    const fd = new FormData()
    fd.append("value", settingValue)
    fd.append("type", "json")
    fd.append("is_public", "1")
    startTransition(async () => {
      const result = await saveSettingAction(key, fd, locale)
      if (!result.ok) {
        setError(result.message ?? t("error"))
      } else {
        setEditingKey(null)
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="space-y-4">
        {settings.length === 0 ? (
          <p className="text-sm text-[#6B7280]">{t("settingsEmpty")}</p>
        ) : (
          settings.map((s) => (
            <div
              key={s.key}
              className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-[#111827]">{s.key}</p>
                  {s.label && <p className="text-xs text-[#9CA3AF]">{s.label}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingKey(s.key)
                    setSettingValue(settingDisplayValue(s.value))
                  }}
                  className="text-xs font-semibold text-[#006EA8] hover:underline"
                >
                  {t("edit")}
                </button>
              </div>
              {editingKey === s.key ? (
                <div className="mt-3 space-y-2">
                  <textarea
                    rows={6}
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 font-mono text-xs focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8]"
                    value={settingValue}
                    onChange={(e) => setSettingValue(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <PrimaryButton
                      type="button"
                      disabled={pending}
                      onClick={() => saveSetting(s.key)}
                      className="h-8 rounded-lg px-3 text-xs font-semibold"
                    >
                      {pending ? t("saving") : t("save")}
                    </PrimaryButton>
                    <button
                      type="button"
                      onClick={() => setEditingKey(null)}
                      className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <pre className="mt-2 max-h-40 overflow-auto rounded bg-[#F9FAFB] p-2 font-mono text-xs text-[#525252]">
                  {settingDisplayValue(s.value)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
