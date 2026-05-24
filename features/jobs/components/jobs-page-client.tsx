"use client"

import { useState, type ComponentProps, type FormEvent } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { PrimaryButton } from "@/components/ui/primary-button"
import { StaggerInView, StaggerItem } from "@/features/shared-home"
import { JobsListing } from "@/features/jobs/components/jobs-listing"
import type { Category, Job } from "@/lib/api/types"

type JobsPageClientProps = {
  locale: string
  jobs: Job[]
  total: number
  categories: Category[]
  hero: {
    eyebrow: string
    title: string
    description: string
    searchPlaceholder: string
    search: string
  }
  listingLabels: ComponentProps<typeof JobsListing>["labels"]
  stateOptions: string[]
  categoryOptions: string[]
}

export function JobsPageClient({
  locale,
  jobs,
  total,
  categories,
  hero,
  listingLabels,
  stateOptions,
  categoryOptions,
}: JobsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAppliedSearch(searchQuery.trim())
  }

  return (
    <>
      {/* Hero Section — matches provided design, transparent background */}
      <div className="relative flex flex-col items-center justify-center w-full pt-12 pb-8 px-2 sm:px-0">
        <StaggerInView className="w-full max-w-[1312px] flex flex-col items-center gap-12">
          <StaggerItem>
            <div className="flex flex-col items-center gap-6 w-full">
              {/* Eyebrow/tag with globe icon */}
              <span className="inline-flex items-center gap-2 rounded-[8px] bg-[#40A0CA]/25 px-4 py-2 text-[13px] font-medium tracking-[0.06em] text-[#40A0CA] shadow-sm w-[180px] h-[32px] justify-center">
                <Image src="/footer/icon-link.svg" alt="" width={16} height={16} aria-hidden />
                <span className="text-[12px] font-normal leading-[1.16]">{hero.eyebrow}</span>
              </span>
              <h1 className="font-heading  text-[36px] font-bold leading-[1.5] text-[#171717] capitalize text-center"> 
                {hero.title}
              </h1>
              <p className="max-w-[700px] text-[16px] leading-[1.16] text-[#525252] text-center font-normal">
                {hero.description}
              </p>
              <form
                className="mt-2 flex w-full max-w-[644px] flex-col gap-4 sm:flex-row items-center justify-center"
                onSubmit={handleSearch}
              >
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                  <Input
                    name="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={hero.searchPlaceholder}
                    className="h-[44px] flex-1 rounded-[8px] border border-[#E8F2FF] bg-white px-4 text-[#737373] placeholder:text-[#737373] text-[14px] font-normal shadow-[0_1px_18px_2px_#E8F2FF_inset] focus:border-[#40A0CA] focus:bg-white/95"
                    style={{background:'linear-gradient(180deg,rgba(0,110,168,0.15) 0%,rgba(0,86,133,0.15) 100%)'}}
                  />
                  <PrimaryButton
                    type="submit"
                    className="h-[44px] w-full sm:w-[150px] rounded-[12px] text-[16px] font-medium"
                  >
                    {hero.search}
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </StaggerItem>
        </StaggerInView>
      </div>

      <JobsListing
        locale={locale}
        jobs={jobs}
        total={total}
        categories={categories}
        searchQuery={appliedSearch}
        labels={listingLabels}
        stateOptions={stateOptions}
        categoryOptions={categoryOptions}
      />
    </>
  )
}
