// server wrapper to provide locale + session to the client component
import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import UserEducationClient from "./client"
import { getUserPortfolio } from "@/lib/api/services/portfolio.service"

export default async function UserEducationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()

  if (!session.isLoggedIn || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  let initialPortfolio: Record<string, any> | undefined = undefined
  try {
    initialPortfolio = await getUserPortfolio(session.accessToken!, locale)
  } catch (err) {
    // ignore - client will fetch if needed
  }

  return <UserEducationClient locale={locale} initialPortfolio={initialPortfolio} />
}
