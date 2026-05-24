"use client"

import Image from "next/image"
import { useMemo, useState, useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { PrimaryButton } from "@/components/ui/primary-button"
import type { AboutPageContent, AboutFeature } from "@/lib/api/services/about.service"
import { saveAboutAction } from "@/features/admin/actions/admin-actions"

const LOCALES = ["ar", "en", "de"] as const

type LocaleKey = (typeof LOCALES)[number]

type FormState = {
  title: Record<LocaleKey, string>
  descriptionLeft: Record<LocaleKey, string>
  descriptionRight: Record<LocaleKey, string>
  secondTitle: Record<LocaleKey, string>
  secondDescription: Record<LocaleKey, string>
  videoUrl: string
}

type FeatureForm = {
  id?: number | string
  title: Record<LocaleKey, string>
  description: Record<LocaleKey, string>
}

function emptyLocale(): Record<LocaleKey, string> {
  return { ar: "", en: "", de: "" }
}

function emptyForm(): FormState {
  return {
    title: emptyLocale(),
    descriptionLeft: emptyLocale(),
    descriptionRight: emptyLocale(),
    secondTitle: emptyLocale(),
    secondDescription: emptyLocale(),
    videoUrl: "",
  }
}

function emptyFeature(): FeatureForm {
  return { title: emptyLocale(), description: emptyLocale() }
}

function mapContentToForm(content: AboutPageContent | null): FormState {
  if (!content) return emptyForm()
  return {
    title: { ar: content.title, en: content.title, de: content.title },
    descriptionLeft: {
      ar: content.descriptionLeft,
      en: content.descriptionLeft,
      de: content.descriptionLeft,
    },
    descriptionRight: {
      ar: content.descriptionRight,
      en: content.descriptionRight,
      de: content.descriptionRight,
    },
    secondTitle: {
      ar: content.secondTitle,
      en: content.secondTitle,
      de: content.secondTitle,
    },
    secondDescription: {
      ar: content.secondDescription,
      en: content.secondDescription,
      de: content.secondDescription,
    },
    videoUrl: content.video || "",
  }
}

function mapFeaturesToForm(features: AboutFeature[]): FeatureForm[] {
  return features.map((f) => ({
    id: f.id,
    title: { ar: f.title, en: f.title, de: f.title },
    description: { ar: f.description, en: f.description, de: f.description },
  }))
}

// ---------- sub-components ----------

function LocaleCard({
  lang,
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
}: {
  lang: string
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  rows?: number
}) {
  return (
    <label className="block text-sm text-[#374151]">
      <span className="mb-1 block font-medium">
        <span className="me-1.5 rounded bg-[#EAF4FB] px-1.5 py-0.5 text-xs font-bold text-[#006EA8]">
          {lang.toUpperCase()}
        </span>
        {label}
      </span>
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8]"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8]"
        />
      )}
    </label>
  )
}

// ---------- Main Component ----------

export function AdminAboutPanel({
  content,
  locale,
}: {
  content: AboutPageContent | null
  locale: string
}) {
  const t = useTranslations("Admin.about")
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<"main" | "second" | "features">("main")

  const [form, setForm] = useState<FormState>(() => mapContentToForm(content))
  const [features, setFeatures] = useState<FeatureForm[]>(() =>
    mapFeaturesToForm(content?.features ?? [])
  )
  const [primaryImage, setPrimaryImage] = useState<File | null>(null)
  const [secondaryImage, setSecondaryImage] = useState<File | null>(null)

  const hasCurrentImages = useMemo(
    () => !!content?.image || !!content?.secondImage,
    [content]
  )

  // ---- features helpers ----
  function addFeature() {
    setFeatures((prev) => [...prev, emptyFeature()])
  }
  function removeFeature(idx: number) {
    setFeatures((prev) => prev.filter((_, i) => i !== idx))
  }
  function updateFeatureField(
    idx: number,
    field: "title" | "description",
    lang: LocaleKey,
    value: string
  ) {
    setFeatures((prev) =>
      prev.map((f, i) =>
        i === idx ? { ...f, [field]: { ...f[field], [lang]: value } } : f
      )
    )
  }

  function appendLocalized(
    formData: FormData,
    key: string,
    values: Record<LocaleKey, string>
  ) {
    for (const lang of LOCALES) {
      const value = values[lang]?.trim()
      if (value) formData.append(`${key}[${lang}]`, value)
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const formData = new FormData()
    appendLocalized(formData, "title", form.title)
    appendLocalized(formData, "description_left", form.descriptionLeft)
    appendLocalized(formData, "description_right", form.descriptionRight)
    appendLocalized(formData, "second_title", form.secondTitle)
    appendLocalized(formData, "second_description", form.secondDescription)
    if (form.videoUrl) {
      formData.append("video", form.videoUrl)
    }

    // Features
    features.forEach((f, idx) => {
      if (f.id) formData.append(`features[${idx}][id]`, String(f.id))
      appendLocalized(formData, `features[${idx}][title]`, f.title)
      appendLocalized(formData, `features[${idx}][description]`, f.description)
    })

    if (primaryImage) formData.append("image", primaryImage)
    if (secondaryImage) formData.append("second_image", secondaryImage)

    startTransition(async () => {
      const result = await saveAboutAction(formData, locale)
      if (!result.ok) {
        setError(result.message ?? t("error"))
        return
      }
      setSuccess(true)
      router.refresh()
    })
  }

  const tabClass = (tab: typeof activeTab) =>
    `px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
      activeTab === tab
        ? "border-b-2 border-[#006EA8] text-[#006EA8]"
        : "text-[#6B7280] hover:text-[#111827]"
    }`

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-6"
    >
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-[#E5E7EB]">
        <button type="button" className={tabClass("main")} onClick={() => setActiveTab("main")}>
          {t("fields.title")} / وصف الهيدر
        </button>
        <button
          type="button"
          className={tabClass("second")}
          onClick={() => setActiveTab("second")}
        >
          القسم الثاني
        </button>
        <button
          type="button"
          className={tabClass("features")}
          onClick={() => setActiveTab("features")}
        >
          المزايا ({features.length})
        </button>
      </div>

      {/* Alert Messages */}
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

      {/* ---- Main section tab ---- */}
      {activeTab === "main" && (
        <div className="space-y-4">
          <p className="text-xs text-[#6B7280]">{t("summary")}</p>
          <div className="grid gap-4 lg:grid-cols-3">
            {LOCALES.map((lang) => (
              <div key={lang} className="space-y-3 rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[#006EA8]">{lang}</p>
                <LocaleCard
                  lang={lang}
                  label={t("fields.title")}
                  value={form.title[lang]}
                  onChange={(v) =>
                    setForm((s) => ({ ...s, title: { ...s.title, [lang]: v } }))
                  }
                />
                <LocaleCard
                  lang={lang}
                  label={t("fields.descriptionLeft")}
                  value={form.descriptionLeft[lang]}
                  onChange={(v) =>
                    setForm((s) => ({
                      ...s,
                      descriptionLeft: { ...s.descriptionLeft, [lang]: v },
                    }))
                  }
                  multiline
                />
                <LocaleCard
                  lang={lang}
                  label={t("fields.descriptionRight")}
                  value={form.descriptionRight[lang]}
                  onChange={(v) =>
                    setForm((s) => ({
                      ...s,
                      descriptionRight: { ...s.descriptionRight, [lang]: v },
                    }))
                  }
                  multiline
                />
              </div>
            ))}
          </div>

          {/* Image upload */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-[#374151]">
              {t("fields.image")}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPrimaryImage(e.target.files?.[0] ?? null)}
                className="mt-1 block text-sm"
              />
            </label>
          </div>

          {hasCurrentImages && content?.image && (
            <div className="rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-3">
              <p className="mb-2 text-sm font-semibold text-[#111827]">{t("currentImage")}</p>
              <Image
                src={content.image}
                alt=""
                width={200}
                height={120}
                className="h-28 w-auto rounded-lg object-cover"
                unoptimized={content.image.startsWith("http")}
              />
            </div>
          )}
        </div>
      )}

      {/* ---- Second section tab ---- */}
      {activeTab === "second" && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {LOCALES.map((lang) => (
              <div key={lang} className="space-y-3 rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[#006EA8]">{lang}</p>
                <LocaleCard
                  lang={lang}
                  label={t("fields.secondTitle")}
                  value={form.secondTitle[lang]}
                  onChange={(v) =>
                    setForm((s) => ({
                      ...s,
                      secondTitle: { ...s.secondTitle, [lang]: v },
                    }))
                  }
                />
                <LocaleCard
                  lang={lang}
                  label={t("fields.secondDescription")}
                  value={form.secondDescription[lang]}
                  onChange={(v) =>
                    setForm((s) => ({
                      ...s,
                      secondDescription: { ...s.secondDescription, [lang]: v },
                    }))
                  }
                  multiline
                  rows={4}
                />
              </div>
            ))}
          </div>

          <label className="block mt-4 text-sm text-[#374151]">
            رابط الفيديو (YouTube)
            <input
              type="text"
              value={form.videoUrl}
              onChange={(e) => setForm((s) => ({ ...s, videoUrl: e.target.value }))}
              placeholder="https://www.youtube.com/watch?v=..."
              className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#006EA8] focus:outline-none focus:ring-1 focus:ring-[#006EA8]"
            />
          </label>

          {/* Secondary Image */}
          <label className="block text-sm text-[#374151]">
            {t("fields.secondImage")}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSecondaryImage(e.target.files?.[0] ?? null)}
              className="mt-1 block text-sm"
            />
          </label>

          {content?.secondImage && (
            <div className="rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-3">
              <p className="mb-2 text-sm font-semibold text-[#111827]">
                {t("currentSecondaryImage")}
              </p>
              <Image
                src={content.secondImage}
                alt=""
                width={200}
                height={120}
                className="h-28 w-auto rounded-lg object-cover"
                unoptimized={content.secondImage.startsWith("http")}
              />
            </div>
          )}
        </div>
      )}

      {/* ---- Features tab ---- */}
      {activeTab === "features" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6B7280]">
              أضف أو عدّل مزايا الصفحة (بثلاث لغات)
            </p>
            <button
              type="button"
              onClick={addFeature}
              className="rounded-lg bg-[#006EA8] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#005685]"
            >
              + إضافة ميزة
            </button>
          </div>

          {features.length === 0 && (
            <p className="rounded-lg bg-[#F9FAFB] py-8 text-center text-sm text-[#9CA3AF]">
              لا توجد مزايا. اضغط &quot;+ إضافة ميزة&quot; للبدء.
            </p>
          )}

          <div className="space-y-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="relative rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#006EA8]">
                    ميزة #{idx + 1}
                    {feature.id ? ` (ID: ${feature.id})` : " (جديدة)"}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFeature(idx)}
                    className="text-xs font-semibold text-red-500 hover:text-red-700"
                  >
                    حذف
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {LOCALES.map((lang) => (
                    <div key={lang} className="space-y-2 rounded border bg-white p-3">
                      <span className="rounded bg-[#EAF4FB] px-1.5 py-0.5 text-xs font-bold text-[#006EA8]">
                        {lang.toUpperCase()}
                      </span>
                      <input
                        type="text"
                        placeholder="العنوان"
                        value={feature.title[lang]}
                        onChange={(e) =>
                          updateFeatureField(idx, "title", lang, e.target.value)
                        }
                        className="mt-1 w-full rounded border border-[#E5E7EB] px-2 py-1.5 text-sm focus:border-[#006EA8] focus:outline-none"
                      />
                      <textarea
                        rows={2}
                        placeholder="الوصف"
                        value={feature.description[lang]}
                        onChange={(e) =>
                          updateFeatureField(idx, "description", lang, e.target.value)
                        }
                        className="w-full rounded border border-[#E5E7EB] px-2 py-1.5 text-sm focus:border-[#006EA8] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex flex-wrap gap-3 border-t border-[#E5E7EB] pt-4">
        <PrimaryButton type="submit" disabled={pending} className="h-10 rounded-lg px-6 text-sm">
          {pending ? t("saving") : t("save")}
        </PrimaryButton>
      </div>
    </form>
  )
}
