"use client"



import { useMemo } from "react"

import Autoplay from "embla-carousel-autoplay"

import Image from "next/image"

import { motion } from "motion/react"

import { SectionShell, StaggerInView, StaggerItem } from "@/features/shared-home"

import { Carousel, CarouselContent, CarouselItem, useCarousel } from "@/components/ui/carousel"

import { Card, CardContent } from "@/components/ui/card"

import { cn } from "@/lib/utils"

import type { SuccessStory } from "@/lib/api/types"

import { resolveStoryImageUrl } from "@/features/testimonials/lib/resolve-story-image"

import { TestimonialArrowNext, TestimonialArrowPrev } from "@/features/testimonials/components/testimonial-arrows"
import { Globe } from "lucide-react"



export type TestimonialsLabels = {

  eyebrow: string

  title: string

  description: string

}



type TestimonialsCarouselProps = {

  stories: SuccessStory[]

  labels: TestimonialsLabels

  isRtl: boolean

}



function parseRoleParts(story: SuccessStory) {

  if (story.location) {

    return { role: story.role, location: story.location }

  }

  const parts = story.role.split("|").map((p) => p.trim())

  if (parts.length >= 2) {

    return { role: parts[0], location: parts.slice(1).join(" | ") }

  }

  return { role: story.role, location: undefined }

}



function StoryMeta({

  role,

  location,

  className,

  inverted = false,

  muted = false,

}: {

  role: string

  location?: string

  className?: string

  inverted?: boolean

  muted?: boolean

}) {

  const tone = inverted ? "text-white" : muted ? "text-[#525252]" : "text-[#171717]"



  return (

    <div className={cn("flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:justify-start", className)}>

      <span className={cn("text-[14px] leading-[1.16] sm:text-[16px]", tone)}>{role}</span>

      {location ? (

        <>

          <span className="h-5 w-0.5 shrink-0 bg-[#40A0CA] sm:h-6" aria-hidden />

          <span className={cn("text-[14px] leading-[1.16] sm:text-[16px]", tone)}>{location}</span>

        </>

      ) : null}

    </div>

  )

}



/** RTL: dark (next) then light (prev), matching Figma — no SVG flip (order only). */

function TestimonialCarouselNav({ isRtl }: { isRtl: boolean }) {

  const { scrollPrev, scrollNext } = useCarousel()



  const prevControl = (

    <button

      type="button"

      aria-label={isRtl ? "السابق" : "Previous slide"}

      onClick={scrollPrev}

      className="inline-flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-2 transition-opacity hover:opacity-80"

    >

      <TestimonialArrowPrev />

    </button>

  )



  const nextControl = (

    <button

      type="button"

      aria-label={isRtl ? "التالي" : "Next slide"}

      onClick={scrollNext}

      className="inline-flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-2 transition-opacity hover:opacity-80"

    >

      <TestimonialArrowNext />

    </button>

  )



  return (

    <div className="flex items-center justify-center gap-3 sm:gap-4">

      {isRtl ? (

        <>

          {nextControl}

          {prevControl}

        </>

      ) : (

        <>

          {prevControl}

          {nextControl}

        </>

      )}

    </div>

  )

}



export function TestimonialsCarousel({ stories, labels, isRtl }: TestimonialsCarouselProps) {

  const items = Array.isArray(stories) ? stories : []

  const autoplay = useMemo(

    () => Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true }),

    []

  )

  const tilt = -5



  return (

    <SectionShell stagger={false} className="overflow-visible bg-[#f8fcff] py-12 sm:py-16 lg:py-[82px]">

      <div className="flex w-full flex-col gap-10 overflow-visible sm:gap-14 lg:gap-16">

        <Carousel

          opts={{

            loop: true,

            align: "center",

            direction: isRtl ? "rtl" : "ltr",

            dragFree: false,

            containScroll: "trimSnaps",

          }}

          plugins={[autoplay]}

          className="w-full touch-pan-y overflow-visible"

          dir={isRtl ? "rtl" : "ltr"}

        >

          <StaggerInView

            className={cn(

              "flex w-full  mb-8 flex-col items-center gap-6 text-center sm:gap-8",
 
              "lg:flex-row lg:items-end lg:justify-between lg:text-start",


            )}

            immediate

          >

            <div

              className={cn(

                "flex w-full max-w-[1096px] flex-col  items-center  gap-6",

                "lg:items-start lg:text-start",


              )}

            >

              <StaggerItem immediate>

                <p className="inline-flex items-center gap-2 rounded-lg bg-[rgba(64,160,202,0.25)] px-4 py-2 text-[12px] leading-[1.16] font-normal text-[#40A0CA]">

                  <Globe className="h-4 w-4 shrink-0 text-[#40A0CA]" strokeWidth={1.5} />

                  {labels.eyebrow}

                </p>

              </StaggerItem>

              <div className="space-y-4 sm:space-y-6">

                <StaggerItem immediate>

                  <h2 className="max-w-[635px] font-heading text-[28px] font-bold capitalize leading-[1.5] text-[#171717] sm:text-[32px] lg:text-[36px]">

                    {labels.title}

                  </h2>

                </StaggerItem>

                <StaggerItem immediate>

                  <p className="mx-auto max-w-[500px] text-[14px] font-normal leading-[1.16] text-[#525252] sm:text-[16px] lg:mx-0">

                    {labels.description}

                  </p>

                </StaggerItem>

              </div>

            </div>

            <StaggerItem immediate className="flex w-full shrink-0 items-center justify-center lg:w-auto">

              <TestimonialCarouselNav isRtl={isRtl} />

            </StaggerItem>

          </StaggerInView>



          <div className="w-full overflow-visible px-1 py-3">

            <CarouselContent

              className={cn(

                "ml-0 cursor-grab active:cursor-grabbing",

                isRtl ? "-me-4 pe-0 ps-0 sm:-me-6" : "-ms-4 ps-0 pe-0 sm:-ms-6"

              )}

            >

              {items.map((story, index) => {

                const imageSrc = resolveStoryImageUrl(story.image_url ?? story.image, index)

                const { role, location } = parseRoleParts(story)



                return (

                  <CarouselItem

                    key={story.id}

                    className={cn(

                      "basis-auto shrink-0 overflow-visible pl-0",

                      isRtl ? "pe-4 sm:pe-6" : "ps-4 sm:ps-6"

                    )}

                  >

                    <motion.article

                      initial="rest"

                      whileHover="hover"

                      className="group mx-auto flex w-[min(92vw,445px)] shrink-0 flex-col gap-6 overflow-visible sm:gap-8"

                    >

                      <div className="relative mx-auto h-[min(72vw,445px)] w-full max-w-[445px] shrink-0 overflow-visible">

                        <Image

                          src={imageSrc}

                          alt={story.name}

                          width={445}

                          height={445}

                          className="h-full w-full rounded-[32px] object-cover"

                          unoptimized={imageSrc.startsWith("http")}

                          draggable={false}

                        />

                        <motion.div

                          variants={{

                            rest: { opacity: 0, y: 32, scale: 0.96, rotate: tilt },

                            hover: {

                              opacity: 1,

                              y: 0,

                              scale: 1,

                              rotate: tilt,

                              transition: {

                                type: "spring",

                                stiffness: 280,

                                damping: 26,

                                opacity: { duration: 0.2 },

                              },

                            },

                          }}

                          transition={{ duration: 0.25, ease: "easeOut" }}

                          className={cn(

                            "pointer-events-none absolute inset-x-0 bottom-0 top-auto z-20 mx-auto",

                            "h-[min(380px,94%)] w-[calc(100%-12px)] max-w-[445px] origin-center overflow-visible rounded-[32px]",

                            "border-0 bg-[url('/contact/button-noise.png'),linear-gradient(180deg,#006EA8_0%,#005685_100%)]",

                            "bg-size-[120px_120px,auto] bg-blend-[plus-lighter,normal] text-white",

                            "shadow-[0px_42px_107px_rgba(123,190,255,0.34),0px_24px_32px_rgba(0,86,133,0.19),0px_10px_13px_rgba(0,86,133,0.22),0px_4px_5px_rgba(0,86,133,0.15),0px_0px_0px_4px_#E8F2FF,0px_0px_0px_5px_#FFFFFF,inset_0px_1px_18px_2px_#E8F2FF,inset_0px_1px_4px_2px_#C2DDFF]",

                            "max-lg:hidden"

                          )}

                        >

                          <Card className="h-full overflow-visible border-0 bg-transparent shadow-none">

                            <CardContent

                              className={cn(

                                "flex h-full flex-col justify-between gap-8 p-6 text-start sm:gap-10 sm:p-8 lg:p-10",

                                isRtl && "text-end"

                              )}

                            >

                              <p className="text-[18px] leading-[1.5] sm:text-[20px] lg:text-[24px]">

                                &ldquo;{story.quote}&rdquo;

                              </p>

                              <div className="space-y-4 sm:space-y-5">

                                <StoryMeta role={role} location={location} inverted />

                                <p className="text-[26px] font-bold leading-[1.5] sm:text-[32px] lg:text-[46px]">

                                  {story.name}

                                </p>

                              </div>

                            </CardContent>

                          </Card>

                        </motion.div>

                      </div>



                      {/* Mobile / touch only — hidden on desktop hover to avoid duplicate */}

                      <div

                        className={cn(

                          "flex w-full max-w-[445px] flex-col items-center gap-4 text-center",

                          "[@media(hover:hover)]:hidden",

                          isRtl ? "lg:items-end lg:text-end" : "lg:items-start lg:text-start"

                        )}

                      >

                        <p className="text-[14px] leading-[1.5] text-[#525252] sm:text-[16px]">

                          &ldquo;{story.quote}&rdquo;

                        </p>

                        <StoryMeta role={role} location={location} muted />

                        <p className="text-[24px] font-bold leading-[1.5] text-[#171717] sm:text-[28px]">

                          {story.name}

                        </p>

                      </div>

                    </motion.article>

                  </CarouselItem>

                )

              })}

            </CarouselContent>

          </div>

        </Carousel>

      </div>

    </SectionShell>

  )

}


