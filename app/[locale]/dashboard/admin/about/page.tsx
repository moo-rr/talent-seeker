import { redirect } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getAdminAbout } from "@/lib/api/services/about.service"
import { AdminAboutPanel } from "@/features/admin/components/admin-about-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminAboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()
  const t = await getTranslations("Admin.about")

  if (!session.user || session.user.role !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  let content = null
  let loadError: string | null = null

  try {
    // Fetch content for all supported locales so admin can edit translations
    const [arContent, enContent, deContent] = await Promise.all([
      getAdminAbout(session.accessToken!, "ar"),
      getAdminAbout(session.accessToken!, "en"),
      getAdminAbout(session.accessToken!, "de"),
    ])
    // Create a wrapper with all locales for the admin panel
    const allLocales = { ar: arContent, en: enContent, de: deContent }
    content = { ...(arContent || {}), __allLocales: allLocales } as any
  } catch (err) {
    console.error(err)
    loadError = t("loadError")
  }

  const remountKey = content
    ? [locale, content.title ?? "", content.descriptionLeft ?? "", (content.features ?? []).map((f: any) => f.title ?? "").join("|")].join("||")
    : `empty-${locale}`

  return (
    <AdminPageLayout title={t("title")} description={t("description")}>
      {loadError && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {loadError}
        </p>
      )}
      <AdminAboutPanel key={remountKey} content={content} locale={locale} />
    </AdminPageLayout>
  )
}
