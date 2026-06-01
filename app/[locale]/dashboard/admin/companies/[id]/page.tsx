import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getAdminUsers } from "@/lib/api/services/admin.service"
import { AdminCompanyDetailView } from "@/features/admin/components/admin-company-detail-view"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"

export default async function AdminCompanyDetailPage({
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

  let company: any = null
  try {
    const result = await getAdminUsers(session.accessToken!, "company", 1, locale)
    company = result.data.find((c: any) => c.id === parseInt(id))
  } catch (err) {
    console.error(err)
  }

  if (!company || company.role !== "company") {
    redirect(`/${locale}/dashboard/admin/companies`)
  }

  const companyProfile = company.companyProfile || {}

  return (
    <AdminPageLayout 
      title={companyProfile.companyName || company.name} 
      description={`Company Profile - ${company.email}`}
    >
      <AdminCompanyDetailView company={company} locale={locale} />
    </AdminPageLayout>
  )
}
