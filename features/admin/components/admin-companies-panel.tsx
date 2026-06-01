"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import type { User } from "@/lib/api/types"
import { deleteUserAction } from "@/features/admin/actions/admin-actions"
import { AdminTableCell, AdminTableRow, AdminTableShell } from "./admin-table-shell"
import { cn } from "@/lib/utils"

export function AdminCompaniesPanel({ companies, locale }: { companies: User[]; locale: string }) {
  const t = useTranslations("Admin.companies")
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Ensure we only show items that actually have the `company` role.
  const filteredCompanies = companies.filter((c) => {
    const obj = c as unknown as Record<string, unknown>
    if (typeof obj.role === "string") return obj.role === "company"
    if (Array.isArray(obj.roles)) {
      return obj.roles.some((r) => {
        if (typeof r === "string") return r === "company"
        if (r && typeof r === "object") {
          const rr = r as Record<string, unknown>
          return rr.name === "company" || rr.slug === "company"
        }
        return false
      })
    }
    return false
  })

  // Calculate company-specific statistics
  const totalCompanies = filteredCompanies.length
  const verifiedCompanies = filteredCompanies.filter((c) => c.emailVerified).length
  const activeCompanies = filteredCompanies.filter((c) => c.status === "active").length
  const verificationRate = totalCompanies > 0 ? Math.round((verifiedCompanies / totalCompanies) * 100) : 0
  const activityRate = totalCompanies > 0 ? Math.round((activeCompanies / totalCompanies) * 100) : 0

  const columns = [
    { key: "name", label: t("columns.name"), className: "w-[28%]" },
    { key: "email", label: t("columns.email"), className: "w-[24%]" },
    { key: "phone", label: t("columns.phone"), className: "w-[18%]" },
    { key: "country", label: t("columns.country"), className: "w-[15%]" },
    { key: "status", label: t("columns.status"), className: "w-[10%]" },
    { key: "actions", label: t("columns.actions"), className: "w-[5%]" },
  ]

  function handleDelete(companyId: number | string) {
    if (!confirm(t("deleteConfirm"))) return
    setError(null)
    startTransition(async () => {
      const result = await deleteUserAction(companyId, locale)
      if (!result.ok) {
        setError(result.message ?? t("error"))
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-6 text-start">
      {/* Statistics Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-[#6B7280] mb-2">
            {locale === "ar" ? "إجمالي الشركات" : "Total Companies"}
          </div>
          <div className="text-2xl font-bold text-[#111827]">{totalCompanies}</div>
        </div>
        
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-[#6B7280] mb-2">
            {locale === "ar" ? "التحقق المؤكد" : "Verified"}
          </div>
          <div className="text-2xl font-bold text-[#059669]">{verificationRate}%</div>
          <div className="text-xs text-[#6B7280]">{verifiedCompanies}/{totalCompanies}</div>
        </div>
        
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-[#6B7280] mb-2">
            {locale === "ar" ? "نشط" : "Active"}
          </div>
          <div className="text-2xl font-bold text-[#0891B2]">{activityRate}%</div>
          <div className="text-xs text-[#6B7280]">{activeCompanies}/{totalCompanies}</div>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</p>
      )}

      {/* Companies Table */}
      <AdminTableShell columns={columns} isEmpty={filteredCompanies.length === 0} emptyMessage={t("empty")}>
        {filteredCompanies.map((company, index) => {
          const companyProfile = company.companyProfile || {}
          return (
            <AdminTableRow key={company.id} striped={index % 2 === 1}>
              <AdminTableCell className="w-[28%]">
                <div className="flex items-center gap-3">
                  {company.avatar ? (
                    <Image
                      src={company.avatar}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-lg object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EBF5FB] text-sm font-bold text-[#006EA8]">
                      {(companyProfile.companyName || company.name)?.charAt(0) ?? "C"}
                    </div>
                  )}
                  <div>
                    <Link 
                      href={`/admin/companies/${company.id}`} 
                      className="font-medium hover:underline text-[#006EA8] block"
                    >
                      {companyProfile.companyName || company.name}
                    </Link>
                    {companyProfile.ceoName && (
                      <div className="text-xs text-[#6B7280]">{companyProfile.ceoName}</div>
                    )}
                  </div>
                </div>
              </AdminTableCell>
              <AdminTableCell className="w-[24%] text-xs">{company.email}</AdminTableCell>
              <AdminTableCell className="w-[18%] text-xs">{company.phone || "—"}</AdminTableCell>
              <AdminTableCell className="w-[15%] text-xs">
                {company.country?.name || "—"}
              </AdminTableCell>
              <AdminTableCell className="w-[10%]">
                <span className={cn(
                  "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                  company.status === "active" ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#991B1B]"
                )}>
                  {company.status}
                </span>
              </AdminTableCell>
              <AdminTableCell className="w-[5%]">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleDelete(company.id)}
                  className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                >
                  {t("delete")}
                </button>
              </AdminTableCell>
            </AdminTableRow>
          )
        })}
      </AdminTableShell>
    </div>
  )
}
