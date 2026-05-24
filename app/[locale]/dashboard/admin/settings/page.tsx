import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getAdminSettings } from "@/lib/api/services/settings.service"
import { AdminSettingsPanel } from "@/features/admin/components/admin-settings-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await getSession()
  const t = await getTranslations("Admin.settings")

  if (!session.user || session.user.role !== "admin" || !session.accessToken) {
    redirect(`/${locale}/dashboard`)
  }

  const token = session.accessToken

  const settings = await getAdminSettings(token, locale).catch(() => [])

  return (
    <AdminPageLayout title={t("title")} description={t("description")}>
      <AdminSettingsPanel settings={settings} locale={locale} />
    </AdminPageLayout>
  )
}
