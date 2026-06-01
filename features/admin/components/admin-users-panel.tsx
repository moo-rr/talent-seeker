"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import type { User } from "@/lib/api/types"
import { deleteUserAction } from "@/features/admin/actions/admin-actions"
import { AdminTableCell, AdminTableRow, AdminTableShell } from "./admin-table-shell"
import { cn } from "@/lib/utils"

export function AdminUsersPanel({ users, locale }: { users: User[]; locale: string }) {
  const t = useTranslations("Admin.users")
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Data is pre-filtered from the server (role="user"), no need to filter again
  const filteredUsers = users

  // Calculate user-specific statistics
  const totalUsers = filteredUsers.length
  const verifiedUsers = filteredUsers.filter((u) => u.emailVerified).length
  const activeUsers = filteredUsers.filter((u) => u.status === "active").length
  const verificationRate = totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0
  const activityRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0

  const columns = [
    { key: "name", label: t("columns.name"), className: "w-[20%]" },
    { key: "email", label: t("columns.email"), className: "w-[24%]" },
    { key: "phone", label: t("columns.phone"), className: "w-[16%]" },
    { key: "country", label: t("columns.country"), className: "w-[16%]" },
    { key: "status", label: t("columns.status"), className: "w-[12%]" },
    { key: "actions", label: t("columns.actions"), className: "w-[12%]" },
  ]

  function handleDelete(userId: number | string) {
    if (!confirm(t("deleteConfirm"))) return
    setError(null)
    startTransition(async () => {
      const result = await deleteUserAction(userId, locale)
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
            {locale === "ar" ? "إجمالي المستخدمين" : "Total Users"}
          </div>
          <div className="text-2xl font-bold text-[#111827]">{totalUsers}</div>
        </div>
        
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-[#6B7280] mb-2">
            {locale === "ar" ? "التحقق المؤكد" : "Verified"}
          </div>
          <div className="text-2xl font-bold text-[#059669]">{verificationRate}%</div>
          <div className="text-xs text-[#6B7280]">{verifiedUsers}/{totalUsers}</div>
        </div>
        
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-[#6B7280] mb-2">
            {locale === "ar" ? "نشط" : "Active"}
          </div>
          <div className="text-2xl font-bold text-[#0891B2]">{activityRate}%</div>
          <div className="text-xs text-[#6B7280]">{activeUsers}/{totalUsers}</div>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</p>
      )}

      {/* Users Table */}
      <AdminTableShell columns={columns} isEmpty={filteredUsers.length === 0} emptyMessage={t("empty")}>
        {filteredUsers.map((user, index) => (
          <AdminTableRow key={user.id} striped={index % 2 === 1}>
            <AdminTableCell className="w-[20%]">
              <Link href={`/admin/users/${user.id}`} className="font-medium hover:underline text-[#006EA8]">
                {user.name}
              </Link>
            </AdminTableCell>
            <AdminTableCell className="w-[24%] text-xs">{user.email}</AdminTableCell>
            <AdminTableCell className="w-[16%] text-xs">{user.phone || "—"}</AdminTableCell>
            <AdminTableCell className="w-[16%] text-xs">
              {user.country?.name || "—"}
            </AdminTableCell>
            <AdminTableCell className="w-[12%]">
              <span className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                user.status === "active" ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#991B1B]"
              )}>
                {user.status}
              </span>
            </AdminTableCell>
            <AdminTableCell className="w-[12%]">
              <button
                type="button"
                disabled={pending}
                onClick={() => handleDelete(user.id)}
                className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
              >
                {t("delete")}
              </button>
            </AdminTableCell>
          </AdminTableRow>
        ))}
      </AdminTableShell>
    </div>
  )
}
