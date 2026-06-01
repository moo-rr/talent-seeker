"use client"

import * as React from "react"
import Image from "next/image"
import { Link, stripLocalePrefix, usePathname } from "@/i18n/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { ExternalLink } from "lucide-react"

const ACTIVE_GRADIENT_CLASS = "bg-[linear-gradient(180deg,#006EA8_0%,#005685_100%)]"

type SidebarNavItem = {
  icon: string
  label: string
  href: string
}

type SidebarGroup = {
  title: string
  items: SidebarNavItem[]
}

interface SidebarItemProps {
  iconSrc: string
  label: string
  href: string
  locale: string
  active?: boolean
  flipIcon?: boolean
  isRTL?: boolean
}

function SidebarItem({ iconSrc, label, href, locale, active, flipIcon, isRTL }: SidebarItemProps) {
  return (
    <Link
      locale={locale}
      href={href}
      className={cn(
        "relative isolate flex h-14 w-full flex-none items-center gap-2 self-stretch px-4 py-4 transition-colors",
        active ? "text-transparent" : "text-[#6B7280] hover:bg-white/60 hover:text-[#374151]"
      )}
    >
      {active && (
        <span
          className={cn(
            "absolute top-1/2 z-[2] h-8 w-0.5 -translate-y-1/2",
            ACTIVE_GRADIENT_CLASS,
            isRTL ? "right-0" : "left-0"
          )}
          aria-hidden
        />
      )}

      <div
        className={cn(
          "relative z-0 flex h-6 w-6 flex-none items-center justify-center",
          active &&
            "[filter:brightness(0)_saturate(100%)_invert(28%)_sepia(89%)_saturate(1200%)_hue-rotate(176deg)_brightness(92%)_contrast(101%)]"
        )}
      >
        <Image
          src={iconSrc}
          alt=""
          width={24}
          height={24}
          className={cn(flipIcon && "scale-x-[-1]")}
          aria-hidden
        />
      </div>

      <span
        className={cn(
          "relative z-[1] flex-none text-base leading-[150%]",
          active
            ? cn("bg-clip-text font-semibold text-transparent", ACTIVE_GRADIENT_CLASS)
            : "font-medium text-[#6B7280]"
        )}
      >
        {label}
      </span>
    </Link>
  )
}

function SidebarLogout({ label, flipIcon }: { label: string; flipIcon?: boolean }) {
  const { signOut, loading } = useAuth()

  return (
    <button
      type="button"
      onClick={() => signOut()}
      disabled={loading}
      className="relative flex h-14 w-full items-center gap-2 px-4 py-4 text-[#6B7280] transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
    >
      <Image
        src="/dashboard/logout.svg"
        alt=""
        width={24}
        height={24}
        className={cn(flipIcon && "scale-x-[-1]")}
        aria-hidden
      />
      <span className="text-base font-medium">{loading ? "..." : label}</span>
    </button>
  )
}

function resolveActivePath(pathname: string, hrefs: string[]): string | null {
  const normalized = pathname.replace(/\/$/, "") || "/"
  const sorted = [...hrefs].sort((a, b) => b.length - a.length)

  for (const href of sorted) {
    const h = href.replace(/\/$/, "")
    if (normalized === h || normalized.startsWith(`${h}/`)) {
      return h
    }
  }

  return null
}

function getLabel(locale: string, arabic: string, english: string, german: string) {
  if (locale === "ar") {
    return arabic
  }

  if (locale === "de") {
    return german
  }

  return english
}

function getAdminGroups(locale: string): SidebarGroup[] {
  return [
    {
      title: getLabel(locale, "نظرة عامة", "Overview", "Übersicht"),
      items: [
        {
          icon: "/dashboard/dashboard.svg",
          label: getLabel(locale, "لوحة التحكم", "Dashboard", "Dashboard"),
          href: "/dashboard/admin",
        },
      ],
    },
    {
      title: getLabel(locale, "المحتوى", "Content", "Inhalt"),
      items: [
        {
          icon: "/dashboard/dashboard.svg",
          label: getLabel(locale, "الصفحة الرئيسية", "Home Page", "Startseite"),
          href: "/dashboard/admin/home",
        },
        {
          icon: "/dashboard/profile.svg",
          label: getLabel(locale, "من نحن", "About Page", "Über uns"),
          href: "/dashboard/admin/about",
        },
        {
          icon: "/dashboard/education_Info.svg",
          label: getLabel(locale, "قصص النجاح", "Success Stories", "Erfolgsgeschichten"),
          href: "/dashboard/admin/success-stories",
        },
        {
          icon: "/dashboard/tickets.svg",
          label: getLabel(locale, "الأخبار", "News", "Neuigkeiten"),
          href: "/dashboard/admin/news",
        },
        {
          icon: "/dashboard/jobs.svg",
          label: getLabel(locale, "الخدمات", "Services", "Dienstleistungen"),
          href: "/dashboard/admin/services",
        },
        {
          icon: "/dashboard/favourites.svg",
          label: getLabel(locale, "الفئات", "Categories", "Kategorien"),
          href: "/dashboard/admin/categories",
        },
      ],
    },
    {
      title: getLabel(locale, "الإدارة", "Management", "Verwaltung"),
      items: [
        {
          icon: "/dashboard/education_Info.svg",
          label: getLabel(locale, "المستخدمين", "Users", "Benutzer"),
          href: "/dashboard/admin/users",
        },
        {
          icon: "/dashboard/profile.svg",
          label: getLabel(locale, "الشركات", "Companies", "Unternehmen"),
          href: "/dashboard/admin/companies",
        },
        {
          icon: "/dashboard/jobs.svg",
          label: getLabel(locale, "الوظائف", "Jobs", "Stellenanzeigen"),
          href: "/dashboard/admin/jobs",
        },
        {
          icon: "/dashboard/education_Info.svg",
          label: getLabel(locale, "الإشعارات", "Notifications", "Benachrichtigungen"),
          href: "/dashboard/admin/notifications",
        },
        {
          icon: "/dashboard/tickets.svg",
          label: getLabel(locale, "رسائل التواصل", "Contact Messages", "Kontaktnachrichten"),
          href: "/dashboard/admin/contact",
        },
        {
          icon: "/dashboard/favourites.svg",
          label: getLabel(locale, "الإعدادات", "Settings", "Einstellungen"),
          href: "/dashboard/admin/settings",
        },
      ],
    },
  ]
}

function getUserItems(locale: string, userRole: "user" | "company") {
  const isRTL = locale === "ar"

  if (userRole === "user") {
    return [
      { icon: "/dashboard/dashboard.svg", label: isRTL ? "لوحة التحكم" : "Dashboard", href: "/dashboard/user" },
      { icon: "/dashboard/profile.svg", label: isRTL ? "تحديث الملف الشخصي" : "Update Profile", href: "/dashboard/user/profile" },
      { icon: "/dashboard/education_Info.svg", label: isRTL ? "المؤهلات والتعليم" : "Education Info", href: "/dashboard/user/education" },
      { icon: "/dashboard/jobs.svg", label: isRTL ? "طلبات الوظائف" : "Job Application", href: "/dashboard/user/applications" },
      { icon: "/dashboard/favourites.svg", label: isRTL ? "الوظائف المفضلة" : "Favourite Job", href: "/dashboard/user/favourites" },
      { icon: "/dashboard/tickets.svg", label: isRTL ? "التذاكر" : "Tickets", href: "/dashboard/user/tickets" },
    ]
  }

  return [
    { icon: "/dashboard/dashboard.svg", label: isRTL ? "لوحة التحكم" : "Dashboard", href: "/dashboard/company" },
    { icon: "/dashboard/profile.svg", label: isRTL ? "تحديث الملف الشخصي" : "Update Profile", href: "/dashboard/company/profile" },
    { icon: "/dashboard/jobs.svg", label: isRTL ? "كل الوظائف" : "All Jobs", href: "/dashboard/company/jobs" },
    { icon: "/dashboard/tickets.svg", label: isRTL ? "التذاكر" : "Tickets", href: "/dashboard/company/tickets" },
  ]
}

function SidebarNav({
  locale,
  userRole,
  onNavigate,
}: {
  locale: string
  userRole: "user" | "company" | "admin"
  onNavigate?: () => void
}) {
  const rawPathname = usePathname() ?? ""
  const pathname = stripLocalePrefix(rawPathname)
  const isRTL = locale === "ar"
  const flipIcon = isRTL
  const groups = userRole === "admin" ? getAdminGroups(locale) : []
  const menuItems = userRole === "admin" ? [] : getUserItems(locale, userRole)
  const hrefs = groups.flatMap((group) => group.items.map((item) => item.href))

  if (userRole !== "admin") {
    hrefs.push(...menuItems.map((item) => item.href))
  }

  const activeHref = resolveActivePath(pathname, hrefs)

  const viewSiteLabel = locale === "ar" ? "عرض الموقع" : locale === "de" ? "Seite ansehen" : "View Site"
  const dashboardLabel = locale === "ar" ? "لوحة التحكم" : "Dashboard"

  return (
    <div className="flex-1 flex flex-col justify-between h-full">
      <nav className="flex flex-col gap-0 py-2" onClick={onNavigate}>
        {userRole === "admin"
          ? (<>
              {groups.map((group) => (
                <div key={group.title} className="px-2 pb-2 pt-1">
                  <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B7280]">
                    {group.title}
                  </p>
                  <div className="space-y-0">
                    {group.items.map((item) => (
                      <SidebarItem
                        key={item.href}
                        iconSrc={item.icon}
                        label={item.label}
                        href={item.href}
                        locale={locale}
                        active={activeHref === item.href.replace(/\/$/, "")}
                        flipIcon={flipIcon}
                        isRTL={isRTL}
                      />
                    ))}
                  </div>
                </div>
              ))}

                   {/* ✅ View Site — آخر عنصر للجميع (Admin, User, Company) */}
        <div className="px-2 pb-2 pt-4 mt-auto">
          <div className="mx-2 my-1">
            <Link locale={locale} href="/"
              className={cn(
                "flex h-11 w-full items-center gap-2.5 rounded-lg border border-[#006EA8]/20 bg-gradient-to-r from-[#EBF5FB] to-[#F0F9FF] px-4 text-[#006EA8] transition-all",
                "hover:border-[#006EA8]/40 hover:from-[#D6EFFA] hover:to-[#E4F4FC] hover:shadow-sm"
              )}
            >
              <ExternalLink className="h-[18px] w-[18px] flex-none opacity-70" />
              <span className="text-[14px] font-semibold">{viewSiteLabel}</span>
            </Link>
          </div>
        </div>
            </>)
          : menuItems.map((item) => (
              <SidebarItem
                key={item.href}
                iconSrc={item.icon}
                label={item.label}
                href={item.href}
                locale={locale}
                active={activeHref === item.href.replace(/\/$/, "")}
                flipIcon={flipIcon}
                isRTL={isRTL}
              />
            ))}
      </nav>
      <div className="mt-auto border-t border-[#E5E7EB] px-4 py-4 space-y-2">
      
        <div className={cn(userRole !== "admin" && "pt-2 border-t border-[#E5E7EB]")}>
          <SidebarLogout label={isRTL ? "تسجيل الخروج" : "Logout"} flipIcon={flipIcon} />
        </div>
      </div>
    </div>
  )
}

interface DashboardSidebarProps {
  locale: string
  userRole: "user" | "company" | "admin"
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DashboardSidebar({
  locale,
  userRole,
  open,
  onOpenChange,
}: DashboardSidebarProps) {
  const isRTL = locale === "ar"
  const [internalOpen, setInternalOpen] = React.useState(false)

  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange]
  )

  const sidebarPanel = (
    <aside className="flex h-fit w-full flex-col rounded-[8px] border border-[#E5E7EB] bg-[#F0F4F8] p-0 lg:w-[310px]">
      <SidebarNav locale={locale} userRole={userRole} />
    </aside>
  )

  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent side={isRTL ? "right" : "left"} className="w-[min(100vw,310px)] p-0 lg:hidden overflow-y-auto">
          <SheetTitle className="sr-only">{isRTL ? "القائمة" : "Menu"}</SheetTitle>
          <div className="bg-[#F0F4F8] pt-8 min-h-dvh flex flex-col">
            <SidebarNav locale={locale} userRole={userRole} onNavigate={() => handleOpenChange(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="hidden lg:block">{sidebarPanel}</div>
    </>
  )
}
