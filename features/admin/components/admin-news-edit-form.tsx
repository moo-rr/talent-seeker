"use client"

import { useState, useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { PrimaryButton } from "@/components/ui/primary-button"
import { saveNewsAction } from "@/features/admin/actions/admin-actions"
import { Newspaper, Save, ArrowLeft, ImageIcon, Pencil, X } from "lucide-react"

const LOCALES = ["ar", "en", "de"] as const
type LocaleKey = (typeof LOCALES)[number]

type NewsForm = {
  id?: number
  title: Record<LocaleKey, string>
  description: Record<LocaleKey, string>
  imageFile?: File | null
  imagePreview?: string | null
  existingImage?: string
}

function emptyLocale(): Record<LocaleKey, string> {
  return { ar: "", en: "", de: "" }
}

function parseLocalizedField(value: unknown, locale: LocaleKey): Record<LocaleKey, string> {
  const out = emptyLocale()
  if (!value) return out

  if (typeof value === "string") {
    out[locale] = value
    return out
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>
    if (typeof obj.ar === "string" || typeof obj.en === "string" || typeof obj.de === "string") {
      out.ar = typeof obj.ar === "string" ? obj.ar : ""
      out.en = typeof obj.en === "string" ? obj.en : ""
      out.de = typeof obj.de === "string" ? obj.de : ""
      return out
    }

    for (const k of Object.keys(obj)) {
      const m = k.match(/_?(ar|en|de)$/)
      if (m) {
        const l = m[1] as LocaleKey
        const v = obj[k]
        if (typeof v === "string") out[l] = v
      }
    }

    for (const l of LOCALES) {
      const v = (obj as Record<string, unknown>)[l]
      if (typeof v === "string") out[l] = v
    }

    return out
  }

  return out
}

function LocaleInput({
  label,
  values,
  onChange,
  multiline = false,
  required = false,
  onlyLocale,
}: {
  label: string
  values: Record<LocaleKey, string>
  onChange: (lang: LocaleKey, val: string) => void
  multiline?: boolean
  required?: boolean
  onlyLocale?: LocaleKey
}) {
  return (
    <div>
      {/* Render only the chosen locale's input (or fallback to 'ar') */}
      {(() => {
        const lang = onlyLocale ?? ("ar" as LocaleKey)
        return (
          <label className="block text-sm text-[#374151]">
            <span className="mb-1.5 flex items-center gap-1.5 font-medium">
              <span className="rounded bg-[#EAF4FB] px-1.5 py-0.5 text-xs font-bold text-[#006EA8]">
                {lang.toUpperCase()}
              </span>
              <span>{label}</span>
              {required && lang === "ar" && <span className="text-red-500">*</span>}
            </span>
            {multiline ? (
              <textarea
                rows={5}
                value={values[lang] || ""}
                onChange={(e) => onChange(lang, e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8] transition-colors"
              />
            ) : (
              <input
                type="text"
                value={values[lang] || ""}
                onChange={(e) => onChange(lang, e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8] transition-colors"
              />
            )}
          </label>
        )
      })()}
    </div>
  )
}

export function AdminNewsEditForm({
  newsItem,
  locale,
  isNew = false,
}: {
  newsItem?: any
  locale: string
  isNew?: boolean
}) {
  const isRTL = locale === "ar"
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [editLocale, setEditLocale] = useState<LocaleKey>((locale as LocaleKey) || "ar")

  const [form, setForm] = useState<NewsForm>(() => {
    if (!newsItem || isNew) {
      return {
        title: emptyLocale(),
        description: emptyLocale(),
      }
    }

    const allLocales = (newsItem as any).__allLocales as Record<string, any> | undefined
    if (allLocales) {
      const t = emptyLocale()
      const d = emptyLocale()

      for (const loc of LOCALES) {
        const item = allLocales[loc] ?? {}
        const parsedTitle = parseLocalizedField(item.title ?? item.title_raw ?? item, loc as LocaleKey)
        const parsedDesc = parseLocalizedField(item.description ?? item.content ?? item, loc as LocaleKey)
        t[loc] = parsedTitle[loc] || ""
        d[loc] = parsedDesc[loc] || ""
      }

      const existingImage = allLocales[locale as LocaleKey]?.image ?? allLocales.ar?.image ?? allLocales.en?.image ?? allLocales.de?.image ?? ""

      return {
        id: newsItem.id,
        title: t,
        description: d,
        existingImage,
      }
    }

    const t = emptyLocale()
    const d = emptyLocale()

    // Prefer explicit localized fields when available
    if (typeof newsItem.title_ar === "string") t.ar = newsItem.title_ar
    if (typeof newsItem.title_en === "string") t.en = newsItem.title_en
    if (typeof newsItem.title_de === "string") t.de = newsItem.title_de

    // If no explicit localized titles but a plain `title` exists, set it only for current locale
    if (!t.ar && !t.en && !t.de && typeof newsItem.title === "string") {
      ;(t as any)[locale as LocaleKey] = newsItem.title
    }

    // Descriptions / content
    const fallbackDesc = newsItem.content ?? newsItem.excerpt ?? newsItem.description
    if (typeof newsItem.description_ar === "string") d.ar = newsItem.description_ar
    if (typeof newsItem.description_en === "string") d.en = newsItem.description_en
    if (typeof newsItem.description_de === "string") d.de = newsItem.description_de
    if (!d.ar && !d.en && !d.de && typeof fallbackDesc === "string") {
      ;(d as any)[locale as LocaleKey] = fallbackDesc
    }

    return {
      id: newsItem.id,
      title: t,
      description: d,
      existingImage: newsItem.image ?? "",
    }
  })

  function updateTitle(lang: LocaleKey, val: string) {
    setForm((prev) => ({ ...prev, title: { ...prev.title, [lang]: val } }))
  }
  
  function updateDesc(lang: LocaleKey, val: string) {
    setForm((prev) => ({ ...prev, description: { ...prev.description, [lang]: val } }))
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setForm((prev) => ({ ...prev, imageFile: file, imagePreview: preview }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const formData = new FormData()
    if (form.id) formData.append("id", String(form.id))

    let hasTitle = false
    for (const lang of LOCALES) {
      const t = form.title[lang]?.trim()
      const d = form.description[lang]?.trim()
      if (t) {
        formData.append(`title[${lang}]`, t)
        hasTitle = true
      }
      if (d) formData.append(`description[${lang}]`, d)
    }

    if (!hasTitle) {
      setError(isRTL ? "يجب إدخال عنوان واحد على الأقل" : "At least one title is required")
      return
    }

    if (form.imageFile) {
      formData.append("image", form.imageFile)
    }

    startTransition(async () => {
      const result = await saveNewsAction(formData, locale, form.id)
      if (!result.ok) {
        setError(result.message ?? (isRTL ? "فشل الحفظ" : "Failed to save"))
        return
      }
      setSuccess(true)
      router.refresh()
      setTimeout(() => {
        router.push(`/dashboard/admin/news`)
      }, 1200)
    })
  }

  const imageSrc = form.imagePreview || form.existingImage

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <X className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <Save className="h-4 w-4 shrink-0" />
          <span>{isRTL ? "✓ تم الحفظ بنجاح، جاري التوجيه..." : "✓ Saved successfully, redirecting..."}</span>
        </div>
      )}

      {/* Title & Description */}
      <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
          <Newspaper className="h-4 w-4 text-[#006EA8]" />
          <p className="text-sm font-bold uppercase tracking-widest text-[#006EA8]">
            {isRTL ? "محتوى الخبر" : "News Content"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-[#6B7280]">{isRTL ? "اللغة:" : "Language:"}</label>
          {LOCALES.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setEditLocale(loc)}
              className={`px-3 py-1.5 text-xs font-semibold rounded ${editLocale === loc ? "bg-[#006EA8] text-white" : "bg-[#EBF5FB] text-[#006EA8]"}`}
            >
              {loc.toUpperCase()}
            </button>
          ))}
        </div>
        <LocaleInput
          label={isRTL ? "عنوان الخبر" : "News Title"}
          values={form.title}
          onChange={updateTitle}
          onlyLocale={editLocale}
          required
        />
        <LocaleInput
          label={isRTL ? "وصف/تفاصيل الخبر" : "News Description/Content"}
          values={form.description}
          onChange={updateDesc}
          onlyLocale={editLocale}
          multiline
          required
        />
      </div>

      {/* Image Upload */}
      <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
          <ImageIcon className="h-4 w-4 text-[#006EA8]" />
          <p className="text-sm font-bold uppercase tracking-widest text-[#006EA8]">
            {isRTL ? "صورة الخبر المعروضة" : "News Display Image"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {imageSrc ? (
            <div className="relative h-24 w-40 overflow-hidden rounded-xl border border-[#E5E7EB] bg-gray-50 shadow-sm">
              <Image
                src={imageSrc}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-24 w-40 items-center justify-center rounded-xl border border-dashed border-[#78A3BE] bg-[#F8FBFF]">
              <ImageIcon className="h-8 w-8 text-[#78A3BE]" />
            </div>
          )}
          <div className="space-y-2">
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-2 rounded-lg border border-[#006EA8] px-4 py-2 text-sm font-medium text-[#006EA8] hover:bg-[#006EA8]/10 transition-colors">
                <Pencil className="h-4 w-4" />
                {imageSrc
                  ? (isRTL ? "تغيير الصورة" : "Change Image")
                  : (isRTL ? "رفع صورة" : "Upload Image")}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
            {form.imagePreview && (
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, imageFile: null, imagePreview: null }))}
                className="block text-xs text-red-500 hover:underline text-start"
              >
                {isRTL ? "إزالة" : "Remove"}
              </button>
            )}
            <p className="text-xs text-[#9CA3AF]">
              {isRTL ? "PNG أو JPG أو WEBP · حجم أقصى 5MB" : "PNG, JPG or WEBP · Max size 5MB"}
            </p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-4 pt-2">
        <PrimaryButton
          type="submit"
          disabled={pending || success}
          className="h-11 rounded-lg px-8 text-sm font-semibold"
        >
          <Save className="h-4 w-4 me-2 shrink-0" />
          <span>
            {pending
              ? (isRTL ? "جاري الحفظ..." : "Saving...")
              : isNew
              ? (isRTL ? "إنشاء الخبر" : "Create News")
              : (isRTL ? "حفظ التغييرات" : "Save Changes")}
          </span>
        </PrimaryButton>
        <Link
          locale={locale}
          href="/dashboard/admin/news"
          className="h-11 inline-flex items-center rounded-lg border border-[#E5E7EB] bg-white px-6 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 me-2 rtl:rotate-180" />
          {isRTL ? "رجوع" : "Back"}
        </Link>
      </div>
    </form>
  )
}
