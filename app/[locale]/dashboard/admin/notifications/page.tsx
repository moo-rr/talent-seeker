import { redirect } from "next/navigation"
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
  const session = await getSession()

  if (!session.user || session.user.role !== "admin" || !session.accessToken) {
    redirect(`/${locale}/dashboard`)
  }

  const token = session.accessToken

  const notificationsResult = await getNotifications(token, 1, locale).catch(() => ({ data: [] }))

  return (
    <AdminPageLayout
      title={locale === "ar" ? "الإشعارات" : "Notifications"}
      description={locale === "ar" ? "إدارة الإشعارات والتنبيهات العامة والخاصة بالنظام" : "Review and manage system-wide notifications"}
    >
      <AdminNotificationsPanel notifications={notificationsResult.data} locale={locale} />
    </AdminPageLayout>
  )
}
