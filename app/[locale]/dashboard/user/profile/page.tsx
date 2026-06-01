// server wrapper to provide locale + session to the client component
import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import UserProfileClient from "./client"
import { getProfile } from "@/lib/api/services/auth.service"

export default async function UserProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()

  if (!session.isLoggedIn || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  // prefetch profile server-side so client has initial data and locale
  let initialProfile: Record<string, any> | undefined = undefined
  try {
    const user = await getProfile(session.accessToken!, locale)
    if (user) {
      // Handle nested Userprofile object with camelCase fields from API
      const userProfile = (user as any).Userprofile || {}
      
      // Extract name - use firstName/lastName from Userprofile if available, else split full name
      let firstName = userProfile.firstName || ""
      let lastName = userProfile.lastName || ""
      if (!firstName && !lastName && user.name) {
        const parts = (user.name || "").split(" ")
        firstName = parts.shift() || ""
        lastName = parts.join(" ") || ""
      }

      // Extract category/subcategory from nested Userprofile (camelCase: categoryId, subcategoryId)
      const categoryId = userProfile.categoryId || user.category?.id || undefined
      const subcategoryId = userProfile.subcategoryId || user.sub_category?.id || undefined

      initialProfile = {
        first_name: firstName,
        last_name: lastName,
        email: user.email || "",
        phone: user.phone || "",
        gender: userProfile.gender || user.gender || "",
        dob: userProfile.dateOfBirth || user.dob || "",
        // provide both localized name and ids so client can pick IDs
        country: user.country?.name || "",
        country_id: user.country?.id ?? user.country_id,
        country_code: user.country?.code || "", // dial code like "+20"
        category: user.category?.name || "",
        category_id: categoryId,
        sub_category: user.sub_category?.name || "",
        sub_category_id: subcategoryId,
        avatar: user.avatar || "",
        // Social media from Userprofile
        facebook: userProfile.facebook || user.facebook || "",
        linkedin: userProfile.linkedin || user.linkedin || "",
        twitter: userProfile.twitterX || user.twitterX || "",
        pinterest: userProfile.pinterest || user.pinterest || "",
        locale: user.locale || "",
      }
    }
  } catch (err) {
    // ignore - client will fetch
  }

  return <UserProfileClient locale={locale} initialProfile={initialProfile} />
}
