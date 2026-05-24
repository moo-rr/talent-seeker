import Image from "next/image"
import { getTranslations } from "next-intl/server"
import { PrimaryButton } from "@/components/ui/primary-button"
import { SectionShell, StaggerInView, StaggerItem } from "@/features/shared-home"

export async function HeroSection() {
  const t = await getTranslations("Landing.hero")
  const title = t("title")

  // Function to wrap the highlighted word
  const renderTitle = () => {
    const highlightWords = ["Germany", "ألمانيا", "Deutschland"]
    let parts = [title]

    for (const word of highlightWords) {
      if (title.includes(word)) {
        parts = title.split(word)
        return (
          <>
            {parts[0]}
            <span className="relative inline-block px-4 py-1">
              <span className="relative z-10">{word}</span>
              <Image
                src="/home/splash.png"
                alt=""
                fill
                className="absolute inset-0 z-0 h-full w-full scale-150 object-contain opacity-90"
                aria-hidden
              />
            </span>
            {parts[1]}
          </>
        )
      }
    }
    return title
  }

  return (
    <SectionShell
      id="home"
      stagger={false}
      className="relative min-h-[640px] overflow-hidden bg-[#001222] pb-16 pt-4 sm:min-h-[760px] lg:h-[982px] lg:pb-[30px] lg:pt-0"
    >
      {/* Background Bars */}
      <div
        className="absolute inset-0 z-0 opacity-40"
        style={{
          background:
            "repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(64, 160, 202, 0.15) 50px, rgba(64, 160, 202, 0.15) 100px)",
          maskImage: "linear-gradient(to top, black 0%, transparent 80%)",
          WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 80%)",
        }}
      />

      <Image src="/home/hero/hero-bg-image.png" alt="" fill className="z-1 object-cover opacity-[0.15] mix-blend-overlay" aria-hidden />
      <Image src="/home/hero/hero-blur.svg" alt="" fill className="z-2 object-cover opacity-50" aria-hidden />
      
      <Image
        src="/home/hero/hero-glow-left.svg"
        alt=""
        width={501}
        height={501}
        className="pointer-events-none absolute -top-8 -left-[112px] z-3 opacity-30"
        aria-hidden
      />
      <Image
        src="/home/hero/hero-glow-right.svg"
        alt=""
        width={501}
        height={501}
        className="pointer-events-none absolute -top-8 -right-[112px] z-3 opacity-30"
        aria-hidden
      />

      <StaggerInView
        leadDelay={0.55}
        className="relative z-10 mt-6 flex flex-col items-center gap-8 px-4 pb-8 sm:mt-10 sm:gap-10 lg:mt-[48px] lg:gap-[48px] lg:px-0 lg:pb-[30px]"
      >
        <StaggerItem>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold tracking-[0.06em] text-white/95">
            <Image src="/footer/icon-link.svg" alt="" width={16} height={16} aria-hidden />
            <span>{t("eyebrow")}</span>
          </div>
        </StaggerItem>

        <StaggerItem>
          <h1 className="font-heading mx-auto mt-2 max-w-[866px] text-balance text-center text-[32px] font-bold leading-relaxed text-white sm:mt-4 sm:text-[44px] md:text-[56px] lg:text-[72px] lg:leading-[1.1]">
            {renderTitle()}
          </h1>
        </StaggerItem>

        <StaggerItem>
          <p className="mx-auto mt-4 max-w-[680px] text-pretty text-center text-[15px] font-normal leading-relaxed text-white/80 sm:mt-6 sm:text-[16px] lg:mt-8 lg:text-[18px] lg:leading-[1.6]">
            {t("description")}
          </p>
        </StaggerItem>

        <StaggerItem>
          <PrimaryButton className="mt-4 h-[52px] w-[220px]">
            {t("cta")}
          </PrimaryButton>
        </StaggerItem>
      </StaggerInView>
    </SectionShell>
  )
}
