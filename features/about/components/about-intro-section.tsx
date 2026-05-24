"use client"

import Image from "next/image"
import { useState } from "react"
import { SectionShell, StaggerInView, StaggerItem } from "@/features/shared-home"

type AboutIntroSectionProps = {
  eyebrow: string
  title: string
  descriptionOne: string
  descriptionTwo: string
  featuredImageSrc: string
  secondaryImageSrc: string
  featuredImageAlt: string
  secondaryImageAlt: string
  videoUrl?: string | null
}

export function AboutIntroSection({
  eyebrow,
  title,
  descriptionOne,
  descriptionTwo,
  featuredImageSrc,
  secondaryImageSrc,
  featuredImageAlt,
  secondaryImageAlt,
  videoUrl,
}: AboutIntroSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const isRemoteImage = (src: string) => /^https?:\/\//.test(src)

  return (
    <SectionShell stagger={false} className="bg-white py-[72px] lg:py-[84px]">
      <StaggerInView className="space-y-10 lg:space-y-12">
        <StaggerItem>
          <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
            <div className="space-y-5 lg:col-span-5">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#EAF4FB] px-4 py-2 text-[13px] font-semibold tracking-[0.02em] text-[#0f7abd]">
                <Image src="/footer/icon-link.svg" alt="" width={16} height={16} aria-hidden />
                <span>{eyebrow}</span>
              </div>
              <h1 className="max-w-[560px] text-balance text-[44px] leading-[1.08] font-bold text-[#001222] lg:text-[56px]">
                {title}
              </h1>
            </div>

            <p className="max-w-[520px] text-[17px] leading-relaxed text-[#385066] lg:col-span-3">{descriptionOne}</p>

            <p className="max-w-[520px] text-[17px] leading-relaxed text-[#385066] lg:col-span-4">{descriptionTwo}</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="relative min-h-[400px] lg:min-h-[500px]">
            <div className="absolute bottom-0 h-[300px] w-[70%] overflow-hidden rounded-[16px] border border-[#dce9f4] shadow-[0_20px_42px_rgba(0,25,45,0.16)] ltr:left-0 rtl:right-0 lg:h-[400px]">
              <Image
                src={featuredImageSrc}
                alt={featuredImageAlt}
                fill
                unoptimized={isRemoteImage(featuredImageSrc)}
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
            <div className="absolute top-[40px] h-[240px] w-[55%] overflow-hidden rounded-[16px] border-4 border-white shadow-[0_22px_40px_rgba(0,25,45,0.22)] ltr:right-[2%] rtl:left-[2%] lg:top-[60px] lg:h-[320px] bg-gray-50 z-10">
              {videoUrl && isPlaying ? (
                videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") ? (
                  <iframe
                    src={videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/") + (videoUrl.includes("?") ? "&autoplay=1" : "?autoplay=1")}
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={videoUrl}
                    controls
                    className="h-full w-full object-cover"
                  />
                )
              ) : (
                <div className="group relative h-full w-full">
                  <Image
                    src={secondaryImageSrc}
                    alt={secondaryImageAlt}
                    fill
                    unoptimized={isRemoteImage(secondaryImageSrc)}
                    className="object-cover"
                    sizes="(min-width: 1024px) 34vw, 70vw"
                  />
                  {videoUrl && (
                    <button
                      type="button"
                      onClick={() => setIsPlaying(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/30"
                      aria-label="Play video"
                    >
                      <Image
                        src="/play.svg"
                        alt="Play"
                        width={96}
                        height={96}
                        className="transition-transform group-hover:scale-110"
                      />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </StaggerItem>
      </StaggerInView>
    </SectionShell>
  )
}
