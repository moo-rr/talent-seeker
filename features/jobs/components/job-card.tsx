import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { PrimaryButton } from "@/components/ui/primary-button"
import type { Job } from "@/lib/api/types"
import {
  formatJobEmploymentForCard,
  formatJobSalary,
  formatPostedLabel,
  getJobTitle,
} from "@/features/jobs/lib/job-display"

export type JobCardLabels = {
  department: string
  postedAgo: string
  salaryPeriod: string
  employmentDefault: string
  companyName: string
  companySubLabel: string
  moreDetails: string
}

type JobCardProps = {
  job: Job
  locale: string
  isRtl: boolean
  labels: JobCardLabels
}

export function JobCard({ job, locale, isRtl, labels }: JobCardProps) {
  const title = getJobTitle(job, locale)
  const industry =
    job.company?.company_type?.name ||
    job.category?.name ||
    labels.companySubLabel
  const location = job.state || job.city?.name || job.location || industry
  const postedLabel = formatPostedLabel(job, locale, labels.postedAgo)
  const employmentLabel = formatJobEmploymentForCard(
    job.employment_type ?? job.gender,
    labels.employmentDefault
  )

  return (
    <article className="flex h-full flex-col rounded-[8px] border border-[#78a3be] bg-white p-6 shadow-[0_1px_2px_rgba(0,43,70,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex rounded-[64px] bg-[linear-gradient(270deg,#032C44_0%,#41A0CA_100%)] px-4 py-2 text-[12px] leading-[1.16] text-white">
          {job.category?.name ?? labels.department}
        </span>
        <p className="shrink-0 text-[16px] leading-[1.16] text-[#525252]">{postedLabel}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <h3 className="text-start text-[20px] font-bold leading-[1.16] text-[#262626]">
          {title}
        </h3>
        <p className="shrink-0 text-end text-[16px] leading-[1.16] text-[#525252]">
          {employmentLabel}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-[16px] font-semibold leading-[1.16] text-[#002B46]">
          {formatJobSalary(job, labels.salaryPeriod)}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2 text-start">
        <div className="relative size-[38px] shrink-0 overflow-hidden rounded-full border border-[#78a3be] bg-[#e8f2ff]">
          {job.company?.logo ? (
            <Image
              src={job.company.logo}
              alt=""
              fill
              className="object-cover"
              sizes="38px"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-[10px] font-semibold text-[#006EA8]">
              {(job.company?.name ?? labels.companyName).slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[16px] font-bold leading-[1.16] text-[#262626]">
            {job.company?.name ?? labels.companyName}
          </p>
          <p className="truncate text-[12px] leading-[1.16] text-[#525252]">{location}</p>
        </div>
      </div>

      <PrimaryButton
        asChild
        className="mt-6 h-[44px] w-full rounded-[12px] text-[16px] font-medium"
      >
        <Link href={`/jobs/${job.id}`} className="inline-flex items-center justify-center gap-2">
          {labels.moreDetails}
          <Image
            src="/more.svg"
            alt=""
            width={19}
            height={21}
            aria-hidden
            className={isRtl ? "-scale-x-100" : ""}
          />
        </Link>
      </PrimaryButton>
    </article>
  )
}
