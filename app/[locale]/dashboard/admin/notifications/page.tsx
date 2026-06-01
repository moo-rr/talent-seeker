import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getNotifications } from "@/lib/api/services/notifications.service"
import { AdminNotificationsPanel } from "@/features/admin/components/admin-notifications-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminNotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()

  if (!session.user || session.user.role !== "admin" || !session.accessToken) {
    redirect(`/${locale}/dashboard`)
  }

  const token = session.accessToken

  let notificationsResult = { data: [] }
  try {
    notificationsResult = await getNotifications(token, 1, locale)
  } catch (err) {
    console.error("[AdminNotificationsPage] getNotifications error:", err)
    notificationsResult = { data: [] }
  }

  return (
    <AdminPageLayout
      title={locale === "ar" ? "الإشعارات" : "Notifications"}
      description={locale === "ar" ? "إدارة الإشعارات والتنبيهات العامة والخاصة بالنظام" : "Review and manage system-wide notifications"}
    >
      <AdminNotificationsPanel notifications={notificationsResult.data} locale={locale} />
    </AdminPageLayout>
  )
}
