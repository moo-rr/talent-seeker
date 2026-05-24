"use client"

import { useMemo } from "react"
import { usePathname } from "next/navigation"
import { SiteFooter } from "@/features/shared-home/components/site-footer"
import { SiteHeader } from "@/features/shared-home/components/site-header"

type SiteChromeProps = {
  children: React.ReactNode
  session?: {
    isLoggedIn: boolean
    user?: {
      id: number
      name: string
      email: string
      role: "user" | "company" | "admin"
      avatar?: string
    } | null
  }
}

const AUTH_ROUTES = new Set(["sign-in", "sign-up", "forgot-password"])

export function SiteChrome({ children, session }: SiteChromeProps) {
  const pathname = usePathname() ?? "/"

  const isAuthPage = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean)
    const lastSegment = segments.at(-1)
    return lastSegment ? AUTH_ROUTES.has(lastSegment) : false
  }, [pathname])

  return (
    <>
      {!isAuthPage && (
        <SiteHeader
          initialIsLoggedIn={session?.isLoggedIn}
          initialUser={session?.user}
        />
      )}
      <main className="flex-1">{children}</main>
      {!isAuthPage && <SiteFooter />}
    </>
  )
}
