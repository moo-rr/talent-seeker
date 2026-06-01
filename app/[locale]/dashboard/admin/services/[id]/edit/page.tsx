import { redirect, notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getServicesRaw } from "@/lib/api/services/services.service"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"
import { AdminServiceEditForm } from "@/features/admin/components/admin-service-edit-form"
import { Link } from "@/i18n/navigation"
import { ArrowLeft } from "lucide-react"

type PageProps = {
  params: Promise<{ locale: string; id: string }>
}

export default async function AdminServiceEditPage({ params }: PageProps) {
  const { locale, id } = await params
  setRequestLocale(locale)

  const session = await getSession()
  if (!session.isLoggedIn || !session.user || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }
  if (session.user.role !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  const isRTL = locale === "ar"
  // Fetch raw service data for all locales so admin can edit translations
  const [arList, enList, deList] = await Promise.all([
    getServicesRaw("ar"),
    getServicesRaw("en"),
    getServicesRaw("de"),
  ])

  const arService = arList.find((s) => String(s.id) === id) || null
  const enService = enList.find((s) => String(s.id) === id) || null
  const deService = deList.find((s) => String(s.id) === id) || null

  if (!arService && !enService && !deService) {
    notFound()
  }

  const allLocales = { ar: arService, en: enService, de: deService }
  const base = arService || enService || deService || {}
  const service = { ...(base as any), __allLocales: allLocales } as any

  return (
    <AdminPageLayout
      title={isRTL ? `تعديل الخدمة — ${service.title}` : `Edit Service — ${service.title}`}
      description={
        isRTL
          ? `تعديل بيانات الخدمة ومزاياها · ID: ${service.id}`
          : `Edit service data and features · ID: ${service.id}`
      }
    >
      <AdminServiceEditForm service={service} locale={locale} />
    </AdminPageLayout>
  )
}
