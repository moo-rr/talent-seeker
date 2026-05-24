"use client"

import { SectionShell, StaggerInView, StaggerItem } from "@/features/shared-home"
import type { AboutFeature } from "@/lib/api/services/about.service"

const FEATURE_ICONS = [
  // star / mission
  <svg key="icon-0" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill="currentColor"
      opacity={0.9}
    />
  </svg>,
  // eye / vision
  <svg key="icon-1" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>,
  // trending / development
  <svg key="icon-2" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
    <polyline
      points="23 6 13.5 15.5 8.5 10.5 1 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <polyline
      points="17 6 23 6 23 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>,
]

const FEATURE_COLORS = [
  { bg: "bg-[#EAF4FB]", text: "text-[#0f7abd]", iconBg: "bg-[#0f7abd]" },
  { bg: "bg-[#F0FDF4]", text: "text-[#16a34a]", iconBg: "bg-[#16a34a]" },
  { bg: "bg-[#FFF7ED]", text: "text-[#ea580c]", iconBg: "bg-[#ea580c]" },
]

type Props = {
  features: AboutFeature[]
}

export function AboutFeaturesSection({ features }: Props) {
  if (!features.length) return null

  return (
    <SectionShell stagger={false} className="bg-[#f8fbff] py-[72px] lg:py-[88px]">
      <StaggerInView className="space-y-10">
        {/* Header */}
        <StaggerItem>
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF4FB] px-4 py-1.5 text-sm font-semibold text-[#0f7abd]">
              ✦ {features[0]?.title || ""}
            </span>
          </div>
        </StaggerItem>

        {/* Feature Cards – tag/badge grid layout */}
        <StaggerItem>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const colors = FEATURE_COLORS[index % FEATURE_COLORS.length]
              const icon = FEATURE_ICONS[index % FEATURE_ICONS.length]

              return (
                <div
                  key={feature.id}
                  className={`group relative flex flex-col gap-4 rounded-[20px] border border-white/80 ${colors.bg} p-6 shadow-[0_2px_16px_rgba(0,25,60,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,25,60,0.12)]`}
                >
                  {/* Icon badge */}
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-[12px] ${colors.iconBg} text-white shadow-sm`}
                  >
                    {icon}
                  </div>

                  {/* Tag pill */}
                  <span
                    className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${colors.bg} ${colors.text} ring-1 ring-current/20`}
                  >
                    {feature.title}
                  </span>

                  {/* Description */}
                  <p className="text-[15px] leading-relaxed text-[#374151]">
                    {feature.description}
                  </p>

                  {/* Decorative corner dot */}
                  <span
                    className={`pointer-events-none absolute end-4 top-4 h-2 w-2 rounded-full ${colors.iconBg} opacity-40`}
                    aria-hidden
                  />
                </div>
              )
            })}
          </div>
        </StaggerItem>
      </StaggerInView>
    </SectionShell>
  )
}
