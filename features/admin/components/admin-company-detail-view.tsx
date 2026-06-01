"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import type { User } from "@/lib/api/types"
import { cn } from "@/lib/utils"

export function AdminCompanyDetailView({ company, locale }: { company: User; locale: string }) {
  const t = useTranslations("Admin.companies")
  const isAr = locale === "ar"

  const companyProfile = (company as any).companyProfile || {}
  const country = (company as any).country
  const city = (company as any).city
  const socialMedia = companyProfile.socialMedia || {}

  return (
    <div className="w-full">
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
        {/* Cover Image */}
        {companyProfile.coverImageUrl && (
          <div className="mb-6 -mx-6 -mt-6">
            <Image
              src={companyProfile.coverImageUrl}
              alt="Cover"
              width={1200}
              height={300}
              className="w-full h-64 object-cover rounded-t-[16px]"
              unoptimized
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Logo */}
          <div className="lg:col-span-1 flex flex-col items-center gap-6">
            <div className="w-full flex flex-col items-center">
              {companyProfile.logoUrl ? (
                <Image
                  src={companyProfile.logoUrl}
                  alt={companyProfile.companyName}
                  width={120}
                  height={120}
                  className="h-32 w-32 rounded-lg object-cover mb-4"
                  unoptimized
                />
              ) : (
                <Avatar className="h-32 w-32 mb-4">
                  {company.avatar ? (
                    <AvatarImage src={company.avatar} alt={company.name} />
                  ) : (
                    <AvatarFallback className="text-4xl bg-[#EBF5FB]">
                      {(companyProfile.companyName || company.name || "")?.charAt(0)?.toUpperCase() ?? "C"}
                    </AvatarFallback>
                  )}
                </Avatar>
              )}
              <div className="text-center">
                <h2 className="text-xl font-bold text-[#111827]">
                  {companyProfile.companyName || company.name}
                </h2>
                {companyProfile.ceoName && (
                  <p className="text-sm text-[#6B7280]">{isAr ? "الرئيس التنفيذي:" : "CEO:"} {companyProfile.ceoName}</p>
                )}
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
                  company.status === "active" ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#991B1B]"
                )}>
                  {company.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#374151]">
                  {isAr ? "التحقق" : "Verified"}
                </span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold",
                  company.emailVerified ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#991B1B]"
                )}>
                  {company.emailVerified ? (isAr ? "مؤكد" : "Verified") : (isAr ? "غير مؤكد" : "Not Verified")}
                </span>
              </div>
            </div>
          </div>

          {/* Right Content - Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-bold text-[#111827] mb-4">
                {isAr ? "معلومات التواصل" : "Contact Information"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">
                    {isAr ? "البريد الإلكتروني" : "Email"}
                  </p>
                  <p className="text-sm font-medium text-[#111827]">{company.email}</p>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">
                    {isAr ? "الهاتف" : "Phone"}
                  </p>
                  <p className="text-sm font-medium text-[#111827]">{company.phone || "—"}</p>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">
                    {isAr ? "البلد" : "Country"}
                  </p>
                  <p className="text-sm font-medium text-[#111827]">
                    {country ? country.name : "—"}
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

            {/* Company Profile */}
            <div>
              <h3 className="text-lg font-bold text-[#111827] mb-4">
                {isAr ? "بيانات الشركة" : "Company Details"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] sm:col-span-2">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">
                    {isAr ? "الوصف" : "Description"}
                  </p>
                  <p className="text-sm font-medium text-[#111827]">
                    {companyProfile.description || "—"}
                  </p>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">
                    {isAr ? "عدد الموظفين" : "Employees"}
                  </p>
                  <p className="text-sm font-medium text-[#111827]">
                    {companyProfile.numOfEmployees || "—"}
                  </p>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">
                    {isAr ? "نوع الشركة" : "Company Type"}
                  </p>
                  <p className="text-sm font-medium text-[#111827]">
                    {companyProfile.companyType || "—"}
                  </p>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">
                    {isAr ? "الموقع الإلكتروني" : "Website"}
                  </p>
                  {companyProfile.website ? (
                    <a 
                      href={companyProfile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-[#006EA8] hover:underline truncate block"
                    >
                      {companyProfile.website}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-[#111827]">—</p>
                  )}
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">
                    {isAr ? "الكود البريدي" : "Postal Code"}
                  </p>
                  <p className="text-sm font-medium text-[#111827]">
                    {companyProfile.postalCode || "—"}
                  </p>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">
                    {isAr ? "العنوان" : "Address"}
                  </p>
                  <p className="text-sm font-medium text-[#111827]">
                    {companyProfile.address || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            {(socialMedia.facebook || socialMedia.linkedin || socialMedia.twitterX || socialMedia.pinterest) && (
              <div>
                <h3 className="text-lg font-bold text-[#111827] mb-4">
                  {isAr ? "الروابط الاجتماعية" : "Social Media"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {socialMedia.facebook && (
                    <a 
                      href={socialMedia.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] hover:border-[#006EA8] transition"
                    >
                      <p className="text-xs text-[#6B7280] font-medium mb-1">Facebook</p>
                      <p className="text-sm font-medium text-[#006EA8] truncate">{socialMedia.facebook}</p>
                    </a>
                  )}
                  {socialMedia.linkedin && (
                    <a 
                      href={socialMedia.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] hover:border-[#006EA8] transition"
                    >
                      <p className="text-xs text-[#6B7280] font-medium mb-1">LinkedIn</p>
                      <p className="text-sm font-medium text-[#006EA8] truncate">{socialMedia.linkedin}</p>
                    </a>
                  )}
                  {socialMedia.twitterX && (
                    <a 
                      href={socialMedia.twitterX} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] hover:border-[#006EA8] transition"
                    >
                      <p className="text-xs text-[#6B7280] font-medium mb-1">X (Twitter)</p>
                      <p className="text-sm font-medium text-[#006EA8] truncate">{socialMedia.twitterX}</p>
                    </a>
                  )}
                  {socialMedia.pinterest && (
                    <a 
                      href={socialMedia.pinterest} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] hover:border-[#006EA8] transition"
                    >
                      <p className="text-xs text-[#6B7280] font-medium mb-1">Pinterest</p>
                      <p className="text-sm font-medium text-[#006EA8] truncate">{socialMedia.pinterest}</p>
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
                  <p className="text-xs font-mono text-[#111827] truncate">{company.uuid}</p>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">
                    {isAr ? "التنسيق اللغوي" : "Locale"}
                  </p>
                  <p className="text-sm font-medium text-[#111827]">{(company as any).locale || "—"}</p>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">
                    {isAr ? "تاريخ التسجيل" : "Created At"}
                  </p>
                  <p className="text-sm font-medium text-[#111827]">
                    {new Date((company as any).createdAt).toLocaleDateString(locale)}
                  </p>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">
                    {isAr ? "آخر تحديث" : "Updated At"}
                  </p>
                  <p className="text-sm font-medium text-[#111827]">
                    {new Date((company as any).updatedAt).toLocaleDateString(locale)}
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
