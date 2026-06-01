"use client"

import { useState, useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { PrimaryButton } from "@/components/ui/primary-button"
import { saveSuccessStoryAction } from "@/features/admin/actions/admin-actions"
import { Quote, Save, ArrowLeft, ImageIcon, Pencil, X } from "lucide-react"

const LOCALES = ["ar", "en", "de"] as const
type LocaleKey = (typeof LOCALES)[number]

type StoryForm = {
  id?: number
  name: Record<LocaleKey, string>
  role: Record<LocaleKey, string>
  location: Record<LocaleKey, string>
  quote: Record<LocaleKey, string>
  imageFile?: File | null
  imagePreview?: string | null
  existingImage?: string
}

function emptyLocale(): Record<LocaleKey, string> {
  return { ar: "", en: "", de: "" }
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
  // Render only the chosen locale's input (or fallback to 'ar')
  return (
    <div>
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
                rows={4}
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

export function AdminSuccessStoryEditForm({
  story,
  locale,
  isNew = false,
}: {
  story?: any
  locale: string
  isNew?: boolean
}) {
  const isRTL = locale === "ar"
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [editLocale, setEditLocale] = useState<LocaleKey>((locale as LocaleKey) || "ar")

  const [form, setForm] = useState<StoryForm>(() => {
    if (!story || isNew) {
      return {
        name: emptyLocale(),
        role: emptyLocale(),
        location: emptyLocale(),
        quote: emptyLocale(),
      }
    }
    return {
      id: story.id,
      name: { 
        ar: story.name_ar ?? story.name ?? "", 
        en: story.name_en ?? story.name ?? "", 
        de: story.name_de ?? story.name ?? "" 
      },
      role: { 
        ar: story.role_ar ?? story.role ?? "", 
        en: story.role_en ?? story.role ?? "", 
        de: story.role_de ?? story.role ?? "" 
      },
      location: { 
        ar: story.location_ar ?? story.location ?? "", 
        en: story.location_en ?? story.location ?? "", 
        de: story.location_de ?? story.location ?? "" 
      },
      quote: { 
        ar: story.quote_ar ?? story.quote ?? "", 
        en: story.quote_en ?? story.quote ?? "", 
        de: story.quote_de ?? story.quote ?? "" 
      },
      existingImage: story.image_url ?? story.image ?? "",
    }
  })

  function updateField(field: "name" | "role" | "location" | "quote", lang: LocaleKey, val: string) {
    setForm((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: val },
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

    // Validations: must have at least one name in current/ar locale
    let hasName = false
    let hasLocation = false
    
    for (const lang of LOCALES) {
      const n = form.name[lang]?.trim()
      const r = form.role[lang]?.trim()
      const l = form.location[lang]?.trim()
      const q = form.quote[lang]?.trim()

      if (n) {
        formData.append(`name[${lang}]`, n)
        hasName = true
      }
      if (r) formData.append(`role[${lang}]`, r)
      if (l) {
        formData.append(`location[${lang}]`, l)
        hasLocation = true
      }
      if (q) formData.append(`quote[${lang}]`, q)
    }

    if (!hasName) {
      setError(isRTL ? "يجب إدخال الاسم باللغة العربية على الأقل" : "At least Arabic name is required")
      return
    }

    if (!hasLocation) {
      setError(isRTL ? "حقل الموقع مطلوب" : "Location field is required")
      return
    }

    if (form.imageFile) {
      formData.append("image", form.imageFile)
    }

    startTransition(async () => {
      const result = await saveSuccessStoryAction(formData, locale, form.id)
      if (!result.ok) {
        setError(result.message ?? (isRTL ? "فشل الحفظ" : "Failed to save"))
        return
      }
      setSuccess(true)
      router.refresh()
      setTimeout(() => {
        router.push(`/dashboard/admin/success-stories`)
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

      {/* Profile Details */}
      <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
          <Quote className="h-4 w-4 text-[#006EA8]" />
          <p className="text-sm font-bold uppercase tracking-widest text-[#006EA8]">
            {isRTL ? "بيانات القصة وصاحبها" : "Story & Person Data"}
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
          label={isRTL ? "الاسم" : "Name"}
          values={form.name}
          onChange={(lang, val) => updateField("name", lang, val)}
          required
          onlyLocale={editLocale}
        />
        <LocaleInput
          label={isRTL ? "الدور / المسمى الوظيفي" : "Role / Position"}
          values={form.role}
          onChange={(lang, val) => updateField("role", lang, val)}
          required
          onlyLocale={editLocale}
        />
        <LocaleInput
          label={isRTL ? "الموقع (البلد / المدينة)" : "Location"}
          values={form.location}
          onChange={(lang, val) => updateField("location", lang, val)}
          required
          onlyLocale={editLocale}
        />
        <LocaleInput
          label={isRTL ? "الاقتباس / القصة" : "Quote / Success Story"}
          values={form.quote}
          onChange={(lang, val) => updateField("quote", lang, val)}
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
            {isRTL ? "الصورة الشخصية" : "Profile Picture"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {imageSrc ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-full border border-[#E5E7EB] bg-gray-50 shadow-sm">
              <Image
                src={imageSrc}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-[#78A3BE] bg-[#F8FBFF]">
              <ImageIcon className="h-8 w-8 text-[#78A3BE]" />
            </div>
          )}
          <div className="space-y-2">
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-2 rounded-lg border border-[#006EA8] px-4 py-2 text-sm font-medium text-[#006EA8] hover:bg-[#006EA8]/10 transition-colors">
                <Pencil className="h-4 w-4" />
                {imageSrc
                  ? (isRTL ? "تغيير الصورة" : "Change Picture")
                  : (isRTL ? "رفع صورة" : "Upload Picture")}
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
              ? (isRTL ? "إنشاء القصة" : "Create Story")
              : (isRTL ? "حفظ التغييرات" : "Save Changes")}
          </span>
        </PrimaryButton>
        <Link
          locale={locale}
          href="/dashboard/admin/success-stories"
          className="h-11 inline-flex items-center rounded-lg border border-[#E5E7EB] bg-white px-6 text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 me-2 rtl:rotate-180" />
          {isRTL ? "رجوع" : "Back"}
        </Link>
      </div>
    </form>
  )
}
