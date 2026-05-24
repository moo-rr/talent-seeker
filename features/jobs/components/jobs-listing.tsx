"use client"

import { useMemo, useState } from "react"
import { FilterPanel, type FilterPanelProps } from "@/features/jobs/components/filter-panel"
import { JobsFilterDrawer } from "@/features/jobs/components/jobs-filter-drawer"
import { JobsFilterTrigger } from "@/features/jobs/components/jobs-filter-trigger"
import { JobCard } from "@/features/jobs/components/job-card"
import { StaggerInView, StaggerItem } from "@/features/shared-home"
import type { Category, Job } from "@/lib/api/types"
import { getJobTitle, salaryFromSliderPercent } from "@/features/jobs/lib/job-display"
import { cn } from "@/lib/utils"

type JobsListingProps = {
  locale: string
  jobs: Job[]
  total: number
  categories: Category[]
  searchQuery?: string
  labels: {
    allJobs: string
    filter: string
    department: string
    postedAgo: string
    salaryPeriod: string
    employmentFullTime: string
    companyName: string
    companySubLabel: string
    moreDetails: string
    filterPanelTitle: string
    clearAll: string
    state: string
    categories: string
    salary: string
    salaryMin: string
    salaryMax: string
    from: string
    to: string
    noResults: string
    closeFilters: string
  }
  stateOptions: string[]
  categoryOptions: string[]
}

export function JobsListing({
  locale,
  jobs,
  total,
  categories,
  searchQuery = "",
  labels,
  stateOptions,
  categoryOptions,
}: JobsListingProps) {
  const isRtl = locale === "ar"
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(false)
  const [activeStates, setActiveStates] = useState<number[]>([])
  const [activeCategories, setActiveCategories] = useState<number[]>([])
  const [salaryValue, setSalaryValue] = useState(0)

  const filteredJobs = useMemo(() => {
    let list = jobs
    const q = searchQuery.trim().toLowerCase()

    if (q) {
      list = list.filter((job) => {
        const title = getJobTitle(job, locale).toLowerCase()
        const location = (job.state || job.city?.name || job.location || "").toLowerCase()
        const company = (job.company?.name || "").toLowerCase()
        return title.includes(q) || location.includes(q) || company.includes(q)
      })
    }

    if (activeStates.length > 0) {
      list = list.filter((job) => {
        const state = job.state || job.city?.name || ""
        return activeStates.some((idx) => stateOptions[idx] === state)
      })
    }

    if (activeCategories.length > 0) {
      const selectedCategoryNames = activeCategories
        .map((idx) => categoryOptions[idx]?.trim().toLowerCase())
        .filter((value): value is string => Boolean(value))
      const selectedCategoryIds = categories
        .map((category, idx) => (activeCategories.includes(idx) ? category.id : null))
        .filter((id): id is number => id != null)

      list = list.filter((job) => {
        const jobCategoryId = job.category?.id
        const jobCategoryName = job.category?.name?.trim().toLowerCase()

        if (jobCategoryId != null && selectedCategoryIds.includes(jobCategoryId)) {
          return true
        }

        return jobCategoryName != null && selectedCategoryNames.includes(jobCategoryName)
      })
    }

    if (salaryValue > 0) {
      const minSalary = salaryFromSliderPercent(salaryValue)
      list = list.filter((job) => {
        const from = job.salary_from ?? 0
        const to = job.salary_to ?? from
        return to >= minSalary || from >= minSalary
      })
    }

    return list
  }, [
    activeCategories,
    activeStates,
    categories,
    categoryOptions,
    jobs,
    locale,
    searchQuery,
    salaryValue,
    stateOptions,
  ])

  const activeFilterCount =
    activeStates.length + activeCategories.length + (salaryValue > 0 ? 1 : 0)

  const countLabel = String(
    searchQuery || activeFilterCount > 0
      ? filteredJobs.length
      : total || filteredJobs.length
  )

  const filterPanelProps: FilterPanelProps = {
    filterPanelTitle: labels.filterPanelTitle,
    clearAllLabel: labels.clearAll,
    stateLabel: labels.state,
    categoriesLabel: labels.categories,
    salaryLabel: labels.salary,
    salaryMinLabel: labels.salaryMin,
    salaryMaxLabel: labels.salaryMax,
    salaryFromLabel: labels.from,
    salaryToLabel: labels.to,
    stateOptions,
    categoryOptions,
    activeStates,
    activeCategories,
    salaryValue,
    onClearAll: () => {
      setActiveStates([])
      setActiveCategories([])
      setSalaryValue(0)
    },
    onToggleState: (index) =>
      setActiveStates((prev) =>
        prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]
      ),
    onToggleCategory: (index) =>
      setActiveCategories((prev) =>
        prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]
      ),
    onSalaryChange: setSalaryValue,
  }

  const cardLabels = {
    department: labels.department,
    postedAgo: labels.postedAgo,
    salaryPeriod: labels.salaryPeriod,
    employmentDefault: labels.employmentFullTime,
    companyName: labels.companyName,
    companySubLabel: labels.companySubLabel,
    moreDetails: labels.moreDetails,
  }

  return (
    <StaggerInView className="mx-auto mt-[52px] pb-12 sm:pb-16 lg:pb-[82px] w-full max-w-[1312px] space-y-5 px-4 sm:px-6 lg:px-8">
      <StaggerItem>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[24px] leading-[1.16] font-semibold text-[#171717] sm:text-[32px] lg:text-[36px]">
            {labels.allJobs}{" "}
            <span className="text-[#525252]">({countLabel})</span>
          </h2>

          <JobsFilterTrigger
            label={labels.filter}
            activeCount={activeFilterCount}
            aria-expanded={isDesktopFilterOpen}
            onClick={() => {
              if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
                setIsDesktopFilterOpen((open) => !open)
                return
              }
              setIsFilterDrawerOpen(true)
            }}
          />
        </div>
      </StaggerItem>

      <div className="flex flex-col items-start gap-6 lg:flex-row lg:gap-6 xl:gap-8">
        <StaggerItem className="min-w-0 flex-1">
          {filteredJobs.length === 0 ? (
            <p className="rounded-[16px] border border-dashed border-[#78a3be] bg-[#f8fbff] px-6 py-16 text-center text-lg text-[#525252]">
              {labels.noResults}
            </p>
          ) : (
            <StaggerInView
              className={cn(
                "grid gap-6 justify-center",
                "grid-cols-1 sm:grid-cols-2 md:max-lg:grid-cols-3",
                isDesktopFilterOpen ? "lg:grid-cols-2" : "lg:grid-cols-3"
              )}
            >
              {filteredJobs.map((job) => (
                <StaggerItem key={job.id} className="h-full flex justify-center">
                  <div className="w-full max-w-[420px]">
                    <JobCard
                      job={job}
                      locale={locale}
                      isRtl={isRtl}
                      labels={cardLabels}
                    />
                  </div>
                </StaggerItem>
              ))}
            </StaggerInView>
          )}
        </StaggerItem>

        {isDesktopFilterOpen ? (
          <aside className="hidden w-full shrink-0 lg:block lg:w-[min(100%,421px)] lg:sticky lg:top-24 lg:self-start">
            <FilterPanel {...filterPanelProps} variant="sidebar" />
          </aside>
        ) : null}
      </div>

      <JobsFilterDrawer
        open={isFilterDrawerOpen}
        onOpenChange={setIsFilterDrawerOpen}
        title={labels.filterPanelTitle}
        closeLabel={labels.closeFilters}
        panelProps={{ ...filterPanelProps, variant: "drawer" }}
      />
    </StaggerInView>
  )
}
