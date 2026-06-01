import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getAdminUsers } from "@/lib/api/services/admin.service"
import { AdminUserDetailView } from "@/features/admin/components/admin-user-detail-view"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  setRequestLocale(locale)
  const session = await getSession()

  if (!session.user || session.user.role !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  let user: any = null
  try {
    const result = await getAdminUsers(session.accessToken!, undefined, 1, locale)
    user = result.data.find((u: any) => u.id === parseInt(id))
  } catch (err) {
    console.error(err)
  }

  if (!user || user.role !== "user") {
    redirect(`/${locale}/dashboard/admin/users`)
  }

  return (
    <AdminPageLayout 
      title={user.name} 
      description={`User Profile - ${user.email}`}
    >
      <AdminUserDetailView user={user} locale={locale} />
    </AdminPageLayout>
  )
}
