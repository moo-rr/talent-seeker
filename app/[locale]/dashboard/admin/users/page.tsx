import { redirect } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getAdminUsers } from "@/lib/api/services/admin.service"
import { AdminUsersPanel } from "@/features/admin/components/admin-users-panel"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()
  const t = await getTranslations("Admin.users")

  if (!session.user || session.user.role !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  let users: Awaited<ReturnType<typeof getAdminUsers>>["data"] = []
  try {
    const result = await getAdminUsers(session.accessToken!, "user", 1, locale)
    users = result.data
  } catch (err) {
    console.error(err)
    // ignore
  }

  return (
    <AdminPageLayout title={t("title")} description={t("description")}>
      <AdminUsersPanel users={users} locale={locale} />
    </AdminPageLayout>
  )
}
