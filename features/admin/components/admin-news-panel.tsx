"use client"

import { useState, useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import type { News } from "@/lib/api/types"
import { deleteNewsAction, saveNewsAction } from "@/features/admin/actions/admin-actions"
import { AdminTableCell, AdminTableRow, AdminTableShell } from "./admin-table-shell"
import { PrimaryButton } from "@/components/ui/primary-button"
import Image from "next/image"

const LOCALES = ["ar", "en", "de"] as const
type LocaleKey = (typeof LOCALES)[number]

export function AdminNewsPanel({
  news,
  locale,
}: {
  news: News[]
  locale: string
}) {
  const t = useTranslations("Admin.settings") // reuse translation prefix or custom
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showNewsForm, setShowNewsForm] = useState(false)
  const [newsTitles, setNewsTitles] = useState<Record<LocaleKey, string>>({ ar: "", en: "", de: "" })
  const [newsDesc, setNewsDesc] = useState<Record<LocaleKey, string>>({ ar: "", en: "", de: "" })
  const [imageFile, setImageFile] = useState<File | null>(null)

  function submitNews(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const fd = new FormData()
    for (const loc of LOCALES) {
      if (newsTitles[loc].trim()) fd.append(`title[${loc}]`, newsTitles[loc].trim())
      if (newsDesc[loc].trim()) fd.append(`description[${loc}]`, newsDesc[loc].trim())
    }

    if (imageFile) {
      fd.append("image", imageFile)
    }

    startTransition(async () => {
      const result = await saveNewsAction(fd, locale)
      if (!result.ok) {
        setError(result.message ?? "فشل حفظ الخبر")
      } else {
        setSuccess(true)
        setShowNewsForm(false)
        setNewsTitles({ ar: "", en: "", de: "" })
        setNewsDesc({ ar: "", en: "", de: "" })
        setImageFile(null)
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#111827]">
          {locale === "ar" ? "إدارة الأخبار والمقالات" : "Manage News & Articles"}
        </h2>
        <PrimaryButton
          type="button"
          onClick={() => {
            setShowNewsForm(!showNewsForm)
            setError(null)
            setSuccess(false)
          }}
          className="h-10 rounded-lg px-4 text-sm font-semibold"
        >
          {showNewsForm
            ? locale === "ar"
              ? "إلغاء"
              : "Cancel"
            : locale === "ar"
              ? "+ إضافة خبر جديد"
              : "+ Add New Article"}
        </PrimaryButton>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
          ✓ تم الحفظ بنجاح
        </p>
      )}

      {showNewsForm && (
        <form
          onSubmit={submitNews}
          className="flex flex-col gap-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:p-6"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {LOCALES.map((loc) => (
              <div key={loc} className="space-y-3 rounded-lg border border-[#E5E7EB] bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#006EA8]">{loc}</p>
                <label className="block text-sm text-[#374151]">
                  <span className="font-medium">العنوان ({loc})</span>
                  <input
                    placeholder={t("newsTitle")}
                    className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#006EA8] focus:outline-none"
                    value={newsTitles[loc]}
                    onChange={(e) => setNewsTitles((n) => ({ ...n, [loc]: e.target.value }))}
                    required={loc === "ar"}
                  />
                </label>
                <label className="block text-sm text-[#374151]">
                  <span className="font-medium">المحتوى / الوصف ({loc})</span>
                  <textarea
                    placeholder={t("newsDesc")}
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#006EA8] focus:outline-none"
                    value={newsDesc[loc]}
                    onChange={(e) => setNewsDesc((n) => ({ ...n, [loc]: e.target.value }))}
                    required={loc === "ar"}
                  />
                </label>
              </div>
            ))}
          </div>

          <label className="block max-w-md text-sm text-[#374151]">
            <span className="font-medium">{t("newsImage")}</span>
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-500 file:me-4 file:rounded-lg file:border-0 file:bg-[#EAF4FB] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#006EA8] hover:file:bg-[#dce9f4]"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="flex gap-3 pt-2">
            <PrimaryButton type="submit" disabled={pending} className="h-10 rounded-lg px-6 text-sm font-semibold">
              {pending ? t("saving") : t("saveNews")}
            </PrimaryButton>
          </div>
        </form>
      )}

      <AdminTableShell
        columns={[
          { key: "image", label: locale === "ar" ? "الصورة" : "Image", className: "w-[15%]" },
          { key: "title", label: t("newsColTitle"), className: "w-[50%]" },
          { key: "date", label: t("newsColDate"), className: "w-[20%]" },
          { key: "actions", label: t("newsColActions"), className: "w-[15%]" },
        ]}
        isEmpty={news.length === 0}
        emptyMessage={t("newsEmpty")}
      >
        {news.map((item, index) => (
          <AdminTableRow key={item.id} striped={index % 2 === 1}>
            <AdminTableCell className="w-[15%]">
              {item.image ? (
                <div className="relative h-10 w-16 overflow-hidden rounded border border-gray-100">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized={item.image.startsWith("http")}
                  />
                </div>
              ) : (
                <span className="text-xs text-gray-400">—</span>
              )}
            </AdminTableCell>
            <AdminTableCell className="w-[50%] font-semibold text-[#111827]">
              {item.title}
            </AdminTableCell>
            <AdminTableCell className="w-[20%] text-sm text-[#4B5563]">
              {new Date(item.published_at).toLocaleDateString(locale)}
            </AdminTableCell>
            <AdminTableCell className="w-[15%]">
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (!confirm(t("deleteConfirm"))) return
                  startTransition(async () => {
                    await deleteNewsAction(item.id, locale)
                    router.refresh()
                  })
                }}
                className="text-sm font-bold text-red-600 hover:text-red-800 hover:underline"
              >
                {t("delete")}
              </button>
            </AdminTableCell>
          </AdminTableRow>
        ))}
      </AdminTableShell>
    </div>
  )
}
