"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useLocale, useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { SectionShell, StaggerInView, StaggerItem } from "@/features/shared-home"
import { PrimaryButton } from "@/components/ui/primary-button"
import { NewsEyebrowGlobe } from "@/features/news/components/news-icons"
import { MoveUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Category, Job } from "@/lib/api/types"
import {
  formatJobSalary,
  formatJobEmploymentForCard,
  getJobTitle,
} from "@/features/jobs/lib/job-display"

type JobsSectionClientProps = {
  jobs: Job[]
  categories: Category[]
}

export function JobsSectionClient({ jobs, categories }: JobsSectionClientProps) {
  const t = useTranslations("Landing.jobs")
  const locale = useLocale()
  const [activeFilter, setActiveFilter] = useState<number | "all">("all")

  const filters = useMemo(() => {
    const items: { id: number | "all"; label: string }[] = [
      { id: "all", label: t("filters.all") },
    ]
    for (const cat of categories) {
      items.push({ id: cat.id, label: cat.name })
    }
    if (items.length === 1) {
      return [
        { id: "all" as const, label: t("filters.all") },
        { id: -1, label: t("filters.design") },
        { id: -2, label: t("filters.development") },
        { id: -3, label: t("filters.marketing") },
        { id: -4, label: t("filters.medical") },
      ]
    }
    return items
  }, [categories, t])

  const selectedFilter = filters.find((filter) => filter.id === activeFilter)

  const visibleJobs = useMemo(() => {
    if (activeFilter === "all") return jobs.slice(0, 6)

    const selectedLabel = selectedFilter?.label.trim().toLowerCase()

    return jobs
      .filter((job) => {
        const jobCategoryId = job.category?.id
        const jobCategoryName = job.category?.name?.trim().toLowerCase()

        if (jobCategoryId != null && jobCategoryId === activeFilter) return true
        if (selectedLabel && jobCategoryName === selectedLabel) return true

        return false
      })
      .slice(0, 6)
  }, [activeFilter, jobs, selectedFilter])

  const hasNoResults = activeFilter !== "all" && visibleJobs.length === 0

  return (
    <SectionShell id="jobs" stagger={false} className="overflow-visible bg-white py-12 sm:py-16 lg:py-[82px]">
      <StaggerInView className="mx-auto flex max-w-[1312px] flex-col items-center gap-6 text-center sm:gap-8">
        <StaggerItem>
          <p className="inline-flex items-center justify-center gap-2 rounded-lg bg-[rgba(64,160,202,0.25)] px-4 py-2 text-[12px] leading-[1.16] font-normal text-[#40A0CA]">
            <NewsEyebrowGlobe className="text-[#40A0CA]" />
            {t("eyebrow")}
          </p>
        </StaggerItem>
        <StaggerItem>
          <h2 className="max-w-[520px] font-heading text-balance text-[28px] font-bold capitalize leading-[1.5] text-[#171717] sm:text-[32px] lg:text-[36px]">
            {t("title")}
          </h2>
        </StaggerItem>
        <StaggerItem>
          <p className="max-w-[500px] text-[14px] leading-[1.16] font-normal text-[#525252] sm:text-[16px]">
            {t("description")}
          </p>
        </StaggerItem>
      </StaggerInView>

      <StaggerInView className="mx-auto mt-8 flex w-full max-w-[715px] flex-wrap items-center justify-center gap-0">
        {filters.map((filter) => (
          <StaggerItem key={String(filter.id)}>
            <button
              type="button"
              onClick={() => setActiveFilter(filter.id === "all" ? "all" : filter.id)}
              className={cn(
                "min-w-[120px] flex-1 px-2 py-2 text-center text-[14px] uppercase leading-[1.16] transition-colors sm:min-w-[143px] sm:text-[16px]",
                activeFilter === filter.id
                  ? "border-b border-[#002B46] font-semibold bg-[linear-gradient(180deg,#006EA8_0%,#005685_100%)] bg-clip-text text-transparent"
                  : "border-b border-[#A3A3A3] font-normal text-[#A3A3A3] hover:text-[#525252]"
              )}
            >
              {filter.label}
            </button>
          </StaggerItem>
        ))}
      </StaggerInView>

      {hasNoResults ? (
        <StaggerInView className="mx-auto mt-10 w-full max-w-[760px] rounded-[18px] border border-dashed border-[#78A3BE] bg-[#F8FBFF] px-6 py-10 text-center">
          <p className="text-[18px] font-semibold text-[#002B46]">
            لا توجد وظائف حالياً في هذا التصنيف.
          </p>
          <p className="mt-3 text-[14px] leading-[1.6] text-[#525252]">
            جرّب اختيار تصنيف آخر أو افتح كل الوظائف لرؤية المزيد من الفرص.
          </p>
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-[10px] bg-[linear-gradient(180deg,#006EA8_0%,#005685_100%)] px-6 text-[16px] font-medium text-white"
          >
            {t("filters.all")}
          </button>
        </StaggerInView>
      ) : (
        <StaggerInView className="mx-auto mt-10 grid w-full max-w-[1312px] gap-6 overflow-visible sm:grid-cols-2 xl:grid-cols-3">
          {visibleJobs.map((job) => (
            <StaggerItem key={job.id} className="overflow-visible p-2">
              <Card
                className={cn(
                  "group mx-auto w-full max-w-[420px] cursor-pointer overflow-visible rounded-lg border border-[#78A3BE] bg-white transition-all duration-300",
                  "hover:border-[#4BB7E7] hover:bg-[url('/contact/button-noise.png'),linear-gradient(180deg,#006EA8_0%,#005685_100%)] hover:bg-size-[180px_180px,auto] hover:bg-blend-[plus-lighter,normal] hover:text-white",
                  "hover:shadow-[0_0_0_5px_#FFFFFF,0_0_0_4px_#E8F2FF,0_4px_5px_rgba(0,86,133,0.15),0_10px_13px_rgba(0,86,133,0.22),0_24px_32px_rgba(0,86,133,0.19)]"
                )}
              >
                <CardContent className="space-y-4 p-5 sm:p-6">
                  <Badge className="w-fit rounded-full bg-[linear-gradient(180deg,#006EA8_0%,#005685_100%)] px-3 py-1 text-[12px] text-white group-hover:border group-hover:border-white/30 group-hover:bg-white/15">
                    {job.category?.name ?? "—"}
                  </Badge>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-start text-[18px] font-bold leading-[1.16] text-[#262626] group-hover:text-white sm:text-[20px]">
                      {getJobTitle(job, locale)}
                    </h3>
                    <p className="shrink-0 text-end text-[14px] font-medium leading-[1.16] text-[#002B46] group-hover:text-white sm:text-[16px]">
                      {formatJobEmploymentForCard(job.gender, "Full-time")}
                    </p>
                  </div>
                  <p className="text-start text-[16px] font-medium leading-[1.16] text-[#40A0CA] group-hover:text-[#E8F2FF]">
                    {formatJobSalary(job, t("salaryPeriod") || "/month")}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="grid size-8 shrink-0 place-items-center rounded-full border border-[#78A3BE] group-hover:border-white/60">
                      <span className="size-4 rounded-full border border-[#78A3BE] group-hover:border-white/70" />
                    </div>
                    <p className="text-start text-[14px] leading-[1.16] text-[#525252] group-hover:text-[#e8f2ff] sm:text-[16px]">
                      {job.company?.name ?? "—"}
                    </p>
                  </div>
                  <PrimaryButton asChild className="h-11 rounded-[10px] text-[16px] font-medium sm:text-[18px]">
                    <Link href={`/jobs/${job.id}`}>
                      {t("moreDetails")}
                      <MoveUpRight className="size-5 shrink-0 rtl:-scale-x-100" />
                    </Link>
                  </PrimaryButton>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerInView>
      )}

      <StaggerInView className="mt-8 flex justify-center">
        <StaggerItem>
          <PrimaryButton asChild className="h-11 w-auto min-w-[200px] rounded-[10px] px-8 text-[16px] font-medium sm:text-[18px]">
            <Link href="/jobs">{t("showAll")}</Link>
          </PrimaryButton>
        </StaggerItem>
      </StaggerInView>
    </SectionShell>
  )
}
