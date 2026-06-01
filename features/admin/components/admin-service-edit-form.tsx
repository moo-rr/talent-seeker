"use client"

import { useState, useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { PrimaryButton } from "@/components/ui/primary-button"
import { saveServiceAction } from "@/features/admin/actions/admin-actions"
import {
  Globe,
  Plus,
  Trash2,
  X,
  Save,
  ArrowLeft,
  Pencil,
  ImageIcon,
} from "lucide-react"

const LOCALES = ["ar", "en", "de"] as const
type LocaleKey = (typeof LOCALES)[number]

type FeatureForm = {
  id?: number
  title: Record<LocaleKey, string>
  description: Record<LocaleKey, string>
  icon: string
  iconFile?: File | null
  iconPreview?: string | null
}


type ServiceForm = {
  id?: number
  title: Record<LocaleKey, string>
  description: Record<LocaleKey, string>
  features: FeatureForm[]
  imageFile?: File | null
  imagePreview?: string | null
  existingImage?: string
}

function emptyLocale(): Record<LocaleKey, string> {
  return { ar: "", en: "", de: "" }
}

function emptyFeature(): FeatureForm {
  return { title: emptyLocale(), description: emptyLocale(), icon: "" }
}

function parseLocalizedField(value: unknown, locale: LocaleKey): Record<LocaleKey, string> {
  const out = emptyLocale()
  if (!value) return out

  if (typeof value === "string") {
    // treat plain string as content for the current locale only
    out[locale] = value
    return out
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>
    // try direct ar/en/de keys
    if (typeof obj.ar === "string" || typeof obj.en === "string" || typeof obj.de === "string") {
      out.ar = typeof obj.ar === "string" ? obj.ar : ""
      out.en = typeof obj.en === "string" ? obj.en : ""
      out.de = typeof obj.de === "string" ? obj.de : ""
      return out
    }

    // try keys with suffixes like title_ar, description_en, etc.
    for (const k of Object.keys(obj)) {
      const m = k.match(/_?(ar|en|de)$/)
      if (m) {
        const l = m[1] as LocaleKey
        const v = obj[k]
        if (typeof v === "string") out[l] = v
      }
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
  const lang = onlyLocale ?? ("ar" as LocaleKey)
  return (
    <div>
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
            rows={3}
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
    </div>
  )
}

export function AdminServiceEditForm({
  service,
  locale,
  isNew = false,
}: {
  service?: any
  locale: string
  isNew?: boolean
}) {
  const isRTL = locale === "ar"
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [editLocale, setEditLocale] = useState<LocaleKey>((locale as LocaleKey) || "ar")

  const [form, setForm] = useState<ServiceForm>(() => {
    if (!service || isNew) {
      return {
        title: emptyLocale(),
        description: emptyLocale(),
        features: [emptyFeature()],
      }
    }

    const allLocales = (service as any).__allLocales as Record<string, any> | undefined
    if (allLocales) {
      const title = emptyLocale()
      const description = emptyLocale()

      for (const loc of LOCALES) {
        const item = allLocales[loc] ?? {}
        const parsedTitle = parseLocalizedField(item.title ?? item.title_raw ?? item, loc as LocaleKey)
        const parsedDesc = parseLocalizedField(item.description ?? item.content ?? item, loc as LocaleKey)
        title[loc] = parsedTitle[loc] || ""
        description[loc] = parsedDesc[loc] || ""
      }

      const features: FeatureForm[] = []
      const featuresByLocale: Record<string, any[]> = {}
      for (const loc of LOCALES) {
        featuresByLocale[loc] = Array.isArray(allLocales[loc]?.features) ? allLocales[loc].features : []
      }

      const idSet = new Set<number>()
      for (const loc of LOCALES) {
        for (const f of featuresByLocale[loc]) {
          if (f && typeof f.id === "number") idSet.add(f.id)
        }
      }

      if (idSet.size > 0) {
        for (const idVal of Array.from(idSet)) {
          const fTitle = emptyLocale()
          const fDesc = emptyLocale()
          let icon = ""
          for (const loc of LOCALES) {
            const f = featuresByLocale[loc].find((ff) => ff && ff.id === idVal)
            const parsedTitle = parseLocalizedField(f?.title ?? f?.title_raw ?? f, loc as LocaleKey)
            fTitle[loc] = parsedTitle[loc] || ""
            const parsedDesc = parseLocalizedField(f?.description ?? f?.content ?? f, loc as LocaleKey)
            fDesc[loc] = parsedDesc[loc] || ""
            if (!icon && f?.icon) icon = f.icon
          }
          features.push({ id: idVal, title: fTitle, description: fDesc, icon })
        }
      } else {
        const maxLen = Math.max(...LOCALES.map((l) => featuresByLocale[l].length))
        for (let i = 0; i < maxLen; i++) {
          const fTitle = emptyLocale()
          const fDesc = emptyLocale()
          let icon = ""
          for (const loc of LOCALES) {
            const f = featuresByLocale[loc][i]
            const parsedTitle = parseLocalizedField(f?.title ?? f?.title_raw ?? f, loc as LocaleKey)
            fTitle[loc] = parsedTitle[loc] || ""
            const parsedDesc = parseLocalizedField(f?.description ?? f?.content ?? f, loc as LocaleKey)
            fDesc[loc] = parsedDesc[loc] || ""
            if (!icon && f?.icon) icon = f.icon
          }
          features.push({ title: fTitle, description: fDesc, icon })
        }
      }

      const existingImage = (allLocales[locale as LocaleKey]?.image) ?? allLocales.ar?.image ?? allLocales.en?.image ?? allLocales.de?.image ?? ""

      return {
        id: service.id,
        title,
        description,
        existingImage,
        features,
      }
    }

    // Fallback: single-locale shaped service
    const title = parseLocalizedField(service.title ?? service.title_raw ?? service, locale as LocaleKey)
    const description = parseLocalizedField(service.description ?? service.content ?? service, locale as LocaleKey)

    const features = Array.isArray(service.features)
      ? service.features.map((f: any) => ({
          id: f.id,
          title: parseLocalizedField(f.title ?? f.title_raw ?? f, locale as LocaleKey),
          description: parseLocalizedField(f.description ?? f.content ?? f, locale as LocaleKey),
          icon: f.icon ?? "",
        }))
      : []

    return {
      id: service.id,
      title,
      description,
      existingImage: service.image ?? "",
      features,
    }
  })

  function updateTitle(lang: LocaleKey, val: string) {
    setForm((prev) => ({ ...prev, title: { ...prev.title, [lang]: val } }))
  }
  function updateDesc(lang: LocaleKey, val: string) {
    setForm((prev) => ({ ...prev, description: { ...prev.description, [lang]: val } }))
  }
  function addFeature() {
    setForm((prev) => ({ ...prev, features: [...prev.features, emptyFeature()] }))
  }
  function removeFeature(fi: number) {
    setForm((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== fi) }))
  }
  function updateFeature(fi: number, updated: FeatureForm) {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === fi ? updated : f)),
    }))
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

    for (const lang of LOCALES) {
      const t = form.title[lang]?.trim()
      const d = form.description[lang]?.trim()
      if (t) formData.append(`title[${lang}]`, t)
      if (d) formData.append(`description[${lang}]`, d)
    }

    if (form.imageFile) formData.append("image", form.imageFile)

    form.features.forEach((feat, fi) => {
      if (feat.id) formData.append(`features[${fi}][id]`, String(feat.id))
      for (const lang of LOCALES) {
        const t = feat.title[lang]?.trim()
        const d = feat.description[lang]?.trim()
        if (t) formData.append(`features[${fi}][title][${lang}]`, t)
        if (d) formData.append(`features[${fi}][description][${lang}]`, d)
      }
      // Only send an uploaded file for icon under the expected key; avoid sending plain strings for validation
      if (feat.iconFile) formData.append(`features[${fi}][icon]`, feat.iconFile)
    })

    startTransition(async () => {
      const result = await saveServiceAction(formData, locale, form.id)
      if (!result.ok) {
        setError(result.message ?? (isRTL ? "فشل الحفظ" : "Failed to save"))
        return
      }
      setSuccess(true)
      router.refresh()
      // Navigate back to services list after a short delay
      setTimeout(() => {
        router.push(`/dashboard/admin/services`)
      }, 1200)
    })
  }

  const imageSrc = form.imagePreview || form.existingImage

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Feedback messages */}
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

      {/* Core Service Data */}
      <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
          <Globe className="h-4 w-4 text-[#006EA8]" />
          <p className="text-sm font-bold uppercase tracking-widest text-[#006EA8]">
            {isRTL ? "بيانات الخدمة الأساسية" : "Core Service Data"}
          </p>
        </div>
        <div className="flex items-center gap-2 mb-3">
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
          label={isRTL ? "عنوان الخدمة" : "Service Title"}
          values={form.title}
          onChange={updateTitle}
          required
          onlyLocale={editLocale}
        />
        <LocaleInput
          label={isRTL ? "وصف الخدمة" : "Service Description"}
          values={form.description}
          onChange={updateDesc}
          multiline
          required
          onlyLocale={editLocale}
        />
      </div>

      {/* Image Upload */}
      <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
          <ImageIcon className="h-4 w-4 text-[#006EA8]" />
          <p className="text-sm font-bold uppercase tracking-widest text-[#006EA8]">
            {isRTL ? "صورة الخدمة" : "Service Image"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {imageSrc ? (
            <div className="relative h-24 w-40 overflow-hidden rounded-xl border border-[#E5E7EB] bg-gray-50">
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
                className="block text-xs text-red-500 hover:underline"
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

      {/* Features (Advantages) */}
      <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#006EA8]" />
            <p className="text-sm font-bold uppercase tracking-widest text-[#006EA8]">
              {isRTL
                ? `المزايا والخصائص (${form.features.length})`
                : `Features & Advantages (${form.features.length})`}
            </p>
          </div>
          <button
            type="button"
            onClick={addFeature}
            className="flex items-center gap-1.5 rounded-lg bg-[#006EA8] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#005685] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            {isRTL ? "إضافة ميزة" : "Add Feature"}
          </button>
        </div>

        {form.features.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#78A3BE] bg-[#F8FBFF] py-10 text-center">
            <Globe className="mx-auto h-8 w-8 text-[#78A3BE]" />
            <p className="mt-2 text-sm text-[#9CA3AF]">
              {isRTL ? "لا توجد مزايا. اضغط \"إضافة ميزة\" لإضافة أولى المزايا." : "No features yet. Click \"Add Feature\" to start."}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {form.features.map((feat, fi) => (
            <div key={fi} className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                <span className="inline-flex items-center gap-2 text-xs font-bold text-[#006EA8]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EAF4FB] text-[10px] font-bold text-[#006EA8]">
                    {fi + 1}
                  </span>
                  {isRTL ? "ميزة" : "Feature"} {feat.id ? `(ID: ${feat.id})` : `(${isRTL ? "جديدة" : "New"})`}
                </span>
                <button
                  type="button"
                  title={isRTL ? "حذف الميزة" : "Remove feature"}
                  onClick={() => removeFeature(fi)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <LocaleInput
                label={isRTL ? "عنوان الميزة" : "Feature Title"}
                values={feat.title}
                onChange={(lang, val) =>
                  updateFeature(fi, { ...feat, title: { ...feat.title, [lang]: val } })
                }
                onlyLocale={editLocale}
              />
              <LocaleInput
                label={isRTL ? "وصف الميزة" : "Feature Description"}
                values={feat.description}
                onChange={(lang, val) =>
                  updateFeature(fi, { ...feat, description: { ...feat.description, [lang]: val } })
                }
                multiline
                onlyLocale={editLocale}
              />

              {/* Icon */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#40A0CA] bg-white">
                  {feat.iconPreview ? (
                    <Image src={feat.iconPreview} alt="" width={24} height={24} className="h-6 w-6 object-contain" unoptimized />
                  ) : feat.icon && (feat.icon.startsWith("/") || feat.icon.startsWith("http")) ? (
                    <Image src={feat.icon} alt="" width={24} height={24} className="h-6 w-6 object-contain" unoptimized />
                  ) : (
                    <Globe className="h-6 w-6 text-[#40A0CA]" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="block text-xs text-[#6B7280]">
                    {isRTL ? "رابط الأيقونة (URL أو مسار)" : "Icon URL / Path"}
                    <input
                      type="text"
                      value={feat.icon}
                      onChange={(e) => updateFeature(fi, { ...feat, icon: e.target.value })}
                      placeholder="/icons/my-icon.svg or https://..."
                      className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8] transition-colors"
                    />
                  </label>
                  <label className="cursor-pointer inline-block text-xs font-medium text-[#006EA8] hover:underline">
                    {isRTL ? "أو رفع ملف أيقونة" : "Or upload icon file"}
                    <input
                      type="file"
                      accept="image/*,image/svg+xml"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const preview = URL.createObjectURL(file)
                        updateFeature(fi, { ...feat, iconFile: file, iconPreview: preview })
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit / Cancel */}
      <div className="flex items-center gap-4 pt-2">
        <PrimaryButton
          type="submit"
          disabled={pending || success}
          className="h-11 rounded-lg px-8 text-sm"
        >
          <Save className="h-4 w-4 me-2 shrink-0" />
          <span>
            {pending
              ? (isRTL ? "جاري الحفظ..." : "Saving...")
              : isNew
              ? (isRTL ? "إنشاء الخدمة" : "Create Service")
              : (isRTL ? "حفظ التغييرات" : "Save Changes")}
          </span>
        </PrimaryButton>
        <Link
          locale={locale}
          href="/dashboard/admin/services"
          className="h-11 inline-flex items-center rounded-lg border border-[#E5E7EB] bg-white px-6 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 me-2 rtl:rotate-180" />
          {isRTL ? "رجوع" : "Back"}
        </Link>
      </div>
    </form>
  )
}
