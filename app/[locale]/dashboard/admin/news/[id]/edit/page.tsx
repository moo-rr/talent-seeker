import { redirect, notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import { getAdminNewsItem, getAdminNewsItemRaw } from "@/lib/api/services/news.service"
import { AdminPageLayout } from "@/features/admin/components/admin-page-layout"
import { AdminNewsEditForm } from "@/features/admin/components/admin-news-edit-form"

type PageProps = {
  params: Promise<{ locale: string; id: string }>
}

export default async function AdminNewsEditPage({ params }: PageProps) {
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
  
  // Fetch raw news item for all locales so admin can edit translations
  const [arItem, enItem, deItem] = await Promise.all([
    getAdminNewsItemRaw(id, session.accessToken!, "ar"),
    getAdminNewsItemRaw(id, session.accessToken!, "en"),
    getAdminNewsItemRaw(id, session.accessToken!, "de"),
  ])

  if (!arItem && !enItem && !deItem) {
    notFound()
  }

  const base = arItem || enItem || deItem || {}
  const newsItem = { ...(base as any), __allLocales: { ar: arItem, en: enItem, de: deItem } } as any

  return (
    <AdminPageLayout
      title={isRTL ? `تعديل الخبر — ${newsItem.title || ""}` : `Edit News — ${newsItem.title || ""}`}
      description={
        isRTL
          ? `تعديل بيانات وتفاصيل الخبر والترجمات المتاحة · ID: ${newsItem.id}`
          : `Edit news data, content translations, and image · ID: ${newsItem.id}`
      }
    >
      <AdminNewsEditForm newsItem={newsItem} locale={locale} />
    </AdminPageLayout>
  )
}
