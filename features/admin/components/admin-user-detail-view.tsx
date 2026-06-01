"use client"

import { useTranslations } from "next-intl"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import type { User } from "@/lib/api/types"
import { getCountryById } from "@/lib/countries"
import { cn } from "@/lib/utils"

export function AdminUserDetailView({ user, locale }: { user: User; locale: string }) {
  const t = useTranslations("Admin.users")
  const isAr = locale === "ar"

  const userProfile = (user as any).Userprofile || {}
  const country = (user as any).country
  const city = (user as any).city

  return (
    <div className="w-full">
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Avatar */}
          <div className="lg:col-span-1 flex flex-col items-center gap-6">
            <div className="w-full flex flex-col items-center">
              <Avatar className="h-40 w-40 mb-4">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : (
                  <AvatarFallback className="text-4xl">
                    {(user.name || "").charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="text-center">
                <h2 className="text-xl font-bold text-[#111827]">{user.name}</h2>
                <p className="text-sm text-[#6B7280]">{user.email}</p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="w-full flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#374151]">
                  {isAr ? "الحالة" : "Status"}
                </span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold",
                  user.status === "active" ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#991B1B]"
                )}>
                  {user.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#374151]">
                  {isAr ? "التحقق" : "Verified"}
                </span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold",
                  user.emailVerified ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#991B1B]"
                )}>
                  {user.emailVerified ? (isAr ? "مؤكد" : "Verified") : (isAr ? "غير مؤكد" : "Not Verified")}
                </span>
              </div>
            </div>
          </div>

          {/* Right Content - Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-bold text-[#111827] mb-4">
                {isAr ? "المعلومات الأساسية" : "Basic Information"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">
                    {isAr ? "البريد الإلكتروني" : "Email"}
                  </p>
                  <p className="text-sm font-medium text-[#111827]">{user.email}</p>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">
                    {isAr ? "الهاتف" : "Phone"}
                  </p>
                  <p className="text-sm font-medium text-[#111827]">{user.phone || "—"}</p>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">
                    {isAr ? "البلد" : "Country"}
                  </p>
                  <p className="text-sm font-medium text-[#111827]">
                    {country ? `${country.name}` : "—"}
                  </p>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">
                    {isAr ? "المدينة" : "City"}
                  </p>
                  <p className="text-sm font-medium text-[#111827]">{city?.name || "—"}</p>
                </div>
              </div>
            </div>

            {/* User Profile Details */}
            {userProfile && (
              <div>
                <h3 className="text-lg font-bold text-[#111827] mb-4">
                  {isAr ? "بيانات الملف الشخصي" : "Profile Details"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                    <p className="text-xs text-[#6B7280] font-medium mb-1">
                      {isAr ? "الجنس" : "Gender"}
                    </p>
                    <p className="text-sm font-medium text-[#111827] capitalize">
                      {userProfile.gender || "—"}
                    </p>
                  </div>
                  <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                    <p className="text-xs text-[#6B7280] font-medium mb-1">
                      {isAr ? "تاريخ الميلاد" : "Date of Birth"}
                    </p>
                    <p className="text-sm font-medium text-[#111827]">
                      {userProfile.dateOfBirth || "—"}
                    </p>
                  </div>
                  <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                    <p className="text-xs text-[#6B7280] font-medium mb-1">
                      {isAr ? "التصنيف" : "Category"}
                    </p>
                    <p className="text-sm font-medium text-[#111827]">
                      {userProfile.categoryId ? `Category #${userProfile.categoryId}` : "—"}
                    </p>
                  </div>
                  <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                    <p className="text-xs text-[#6B7280] font-medium mb-1">
                      {isAr ? "التصنيف الفرعي" : "Subcategory"}
                    </p>
                    <p className="text-sm font-medium text-[#111827]">
                      {userProfile.subcategoryId ? `Subcategory #${userProfile.subcategoryId}` : "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Social Links */}
            {(userProfile.facebook || userProfile.linkedin || userProfile.twitterX || userProfile.pinterest) && (
              <div>
                <h3 className="text-lg font-bold text-[#111827] mb-4">
                  {isAr ? "الروابط الاجتماعية" : "Social Links"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userProfile.facebook && (
                    <a 
                      href={userProfile.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] hover:border-[#006EA8] transition"
                    >
                      <p className="text-xs text-[#6B7280] font-medium mb-1">Facebook</p>
                      <p className="text-sm font-medium text-[#006EA8] truncate">{userProfile.facebook}</p>
                    </a>
                  )}
                  {userProfile.linkedin && (
                    <a 
                      href={userProfile.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] hover:border-[#006EA8] transition"
                    >
                      <p className="text-xs text-[#6B7280] font-medium mb-1">LinkedIn</p>
                      <p className="text-sm font-medium text-[#006EA8] truncate">{userProfile.linkedin}</p>
                    </a>
                  )}
                  {userProfile.twitterX && (
                    <a 
                      href={userProfile.twitterX} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] hover:border-[#006EA8] transition"
                    >
                      <p className="text-xs text-[#6B7280] font-medium mb-1">X (Twitter)</p>
                      <p className="text-sm font-medium text-[#006EA8] truncate">{userProfile.twitterX}</p>
                    </a>
                  )}
                  {userProfile.pinterest && (
                    <a 
                      href={userProfile.pinterest} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] hover:border-[#006EA8] transition"
                    >
                      <p className="text-xs text-[#6B7280] font-medium mb-1">Pinterest</p>
                      <p className="text-sm font-medium text-[#006EA8] truncate">{userProfile.pinterest}</p>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Account Info */}
            <div>
              <h3 className="text-lg font-bold text-[#111827] mb-4">
                {isAr ? "معلومات الحساب" : "Account Information"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">
                    {isAr ? "معرّف UUID" : "UUID"}
                  </p>
                  <p className="text-xs font-mono text-[#111827] truncate">{user.uuid}</p>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">
                    {isAr ? "التنسيق اللغوي" : "Locale"}
                  </p>
                  <p className="text-sm font-medium text-[#111827]">{(user as any).locale || "—"}</p>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">
                    {isAr ? "تاريخ التسجيل" : "Created At"}
                  </p>
                  <p className="text-sm font-medium text-[#111827]">
                    {new Date((user as any).createdAt).toLocaleDateString(locale)}
                  </p>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">
                    {isAr ? "آخر تحديث" : "Updated At"}
                  </p>
                  <p className="text-sm font-medium text-[#111827]">
                    {new Date((user as any).updatedAt).toLocaleDateString(locale)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
