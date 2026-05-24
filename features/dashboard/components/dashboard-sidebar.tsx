"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const ACTIVE_GRADIENT = "linear-gradient(180deg, #006EA8 0%, #005685 100%)"

interface SidebarItemProps {
  iconSrc: string
  label: string
  href: string
  active?: boolean
  flipIcon?: boolean
  isRTL?: boolean
}

function SidebarItem({ iconSrc, label, href, active, flipIcon, isRTL }: SidebarItemProps) {
  return (
    <Link
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
            isRTL ? "right-0" : "left-0"
          )}
          style={{ background: ACTIVE_GRADIENT }}
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
          active ? "bg-clip-text font-semibold text-transparent" : "font-medium text-[#6B7280]"
        )}
        style={
          active
            ? {
                backgroundImage: ACTIVE_GRADIENT,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
              }
            : undefined
        }
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

function SidebarNav({
  locale,
  userRole,
  onNavigate,
}: {
  locale: string
  userRole: "user" | "company" | "admin"
  onNavigate?: () => void
}) {
  const pathname = usePathname() ?? ""
  const isRTL = locale === "ar"
  const flipIcon = isRTL

  const getMenuItems = () => {
    switch (userRole) {
      case "user":
        return [
          { icon: "/dashboard/dashboard.svg", label: isRTL ? "لوحة التحكم" : "Dashboard", href: `/${locale}/dashboard/user` },
          { icon: "/dashboard/profile.svg", label: isRTL ? "تحديث الملف الشخصي" : "Update Profile", href: `/${locale}/dashboard/user/profile` },
          { icon: "/dashboard/education_Info.svg", label: isRTL ? "المؤهلات والتعليم" : "Education Info", href: `/${locale}/dashboard/user/education` },
          { icon: "/dashboard/jobs.svg", label: isRTL ? "طلبات الوظائف" : "Job Application", href: `/${locale}/dashboard/user/applications` },
          { icon: "/dashboard/favourites.svg", label: isRTL ? "الوظائف المفضلة" : "Favourite Job", href: `/${locale}/dashboard/user/favourites` },
          { icon: "/dashboard/tickets.svg", label: isRTL ? "التذاكر" : "Tickets", href: `/${locale}/dashboard/user/tickets` },
        ]
      case "company":
        return [
          { icon: "/dashboard/dashboard.svg", label: isRTL ? "لوحة التحكم" : "Dashboard", href: `/${locale}/dashboard/company` },
          { icon: "/dashboard/profile.svg", label: isRTL ? "تحديث الملف الشخصي" : "Update Profile", href: `/${locale}/dashboard/company/profile` },
          { icon: "/dashboard/jobs.svg", label: isRTL ? "كل الوظائف" : "All Jobs", href: `/${locale}/dashboard/company/jobs` },
          { icon: "/dashboard/education_Info.svg", label: isRTL ? "المتقدمين" : "Applicants", href: `/${locale}/dashboard/company/applicants` },
          { icon: "/dashboard/tickets.svg", label: isRTL ? "التذاكر" : "Tickets", href: `/${locale}/dashboard/company/tickets` },
        ]
      case "admin":
        return [
          { icon: "/dashboard/dashboard.svg", label: isRTL ? "لوحة التحكم" : "Dashboard", href: `/${locale}/dashboard/admin` },
          { icon: "/dashboard/education_Info.svg", label: isRTL ? "المستخدمين" : "Users", href: `/${locale}/dashboard/admin/users` },
          { icon: "/dashboard/profile.svg", label: isRTL ? "الشركات" : "Companies", href: `/${locale}/dashboard/admin/companies` },
          { icon: "/dashboard/jobs.svg", label: isRTL ? "الوظائف" : "Jobs", href: `/${locale}/dashboard/admin/jobs` },
          {
            icon: "/dashboard/education_Info.svg",
            label: isRTL ? "قصص النجاح" : "Success Stories",
            href: `/${locale}/dashboard/admin/success-stories`,
          },
          {
            icon: "/dashboard/profile.svg",
            label: isRTL ? "صفحة من نحن" : "About Page",
            href: `/${locale}/dashboard/admin/about`,
          },
          {
            icon: "/dashboard/tickets.svg",
            label: isRTL ? "الأخبار" : "News",
            href: `/${locale}/dashboard/admin/news`,
          },
          {
            icon: "/dashboard/education_Info.svg",
            label: isRTL ? "الإشعارات" : "Notifications",
            href: `/${locale}/dashboard/admin/notifications`,
          },
          { icon: "/dashboard/favourites.svg", label: isRTL ? "الإعدادات" : "Settings", href: `/${locale}/dashboard/admin/settings` },
        ]
      default:
        return []
    }
  }

  const menuItems = getMenuItems()
  const hrefs = menuItems.map((m) => m.href)
  const activeHref = resolveActivePath(pathname, hrefs)

  return (
    <>
      <nav className="flex flex-col gap-0 py-2" onClick={onNavigate}>
        {menuItems.map((item) => (
          <SidebarItem
            key={item.href}
            iconSrc={item.icon}
            label={item.label}
            href={item.href}
            active={activeHref === item.href.replace(/\/$/, "")}
            flipIcon={flipIcon}
            isRTL={isRTL}
          />
        ))}
      </nav>
      <div className="mt-2 border-t border-[#E5E7EB]">
        <SidebarLogout label={isRTL ? "تسجيل الخروج" : "Logout"} flipIcon={flipIcon} />
      </div>
    </>
  )
}

interface DashboardSidebarProps {
  locale: string
  userRole: "user" | "company" | "admin"
}

export function DashboardSidebar({ locale, userRole }: DashboardSidebarProps) {
  const isRTL = locale === "ar"

  const sidebarPanel = (
    <aside className="flex h-fit w-full flex-col rounded-[8px] border border-[#E5E7EB] bg-[#F0F4F8] p-0 lg:w-[310px]">
      <SidebarNav locale={locale} userRole={userRole} />
    </aside>
  )

  return (
    <>
      {/* Mobile menu */}
      <div className="mb-4 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2 border-[#006EA8]/30 bg-white">
              <Menu className="h-5 w-5" />
              <span>{isRTL ? "القائمة" : "Menu"}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side={isRTL ? "right" : "left"} className="w-[min(100vw,310px)] p-0">
            <SheetTitle className="sr-only">{isRTL ? "القائمة" : "Menu"}</SheetTitle>
            <div className="bg-[#F0F4F8] pt-8">
              <SidebarNav
                locale={locale}
                userRole={userRole}
                onNavigate={() => {
                  document.querySelector<HTMLButtonElement>("[data-slot=sheet-close]")?.click()
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">{sidebarPanel}</div>
    </>
  )
}
