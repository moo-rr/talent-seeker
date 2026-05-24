import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { getTranslations } from "next-intl/server"
import { PrimaryButton } from "@/components/ui/primary-button"
import { SectionShell } from "@/features/shared-home"

export async function SupportSection() {
  const t = await getTranslations("Landing.support")

  return (
    <SectionShell stagger={false} className="overflow-visible bg-white py-12 sm:py-14 lg:py-[72px]">
      <div className="relative isolate overflow-hidden rounded-[32px] bg-[url('/contact/button-noise.png'),linear-gradient(180deg,#398DB3_0%,#2D7494_100%)] bg-[length:200px_200px,auto] bg-blend-[plus-lighter,normal] px-6 py-12 text-white shadow-[0_0_0_5px_#FFFFFF,0_0_0_4px_#C2E3FA,0_4px_5px_rgba(75,183,231,0.15),0_10px_13px_rgba(75,183,231,0.22),0_24px_32px_rgba(75,183,231,0.19),0_42px_107px_rgba(123,190,255,0.34)] sm:px-10 sm:py-16 lg:px-14 lg:py-[82px]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay"
          style={{
            backgroundImage: "url('/contact/button-noise.png')",
            backgroundSize: "420px 420px",
          }}
          aria-hidden
        />

        <div className="relative z-[1] flex flex-col items-center gap-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold tracking-[0.06em] text-white/95">
            <Image src="/footer/icon-link.svg" alt="" width={16} height={16}  aria-hidden />
            <span>{t("eyebrow")}</span>
          </div>

          <div className="space-y-4">
            <h2 className="mx-auto max-w-[760px] text-balance font-[family-name:var(--font-encode-sans-narrow)] text-[30px] font-bold leading-[1.1] text-white sm:text-[36px] lg:text-[42px]">
              {t("title")}
            </h2>
            <p className="mx-auto max-w-[640px] text-sm leading-7 text-white/90 sm:text-base">
              {t("description")}
            </p>
          </div>

          <div className="mt-6 flex w-full  items-center justify-center gap-4 flex-row">
            <PrimaryButton asChild className="h-[44px] w-full max-w-[180px] rounded-xl">
              <Link href="/contact" className="inline-flex items-center justify-center gap-2">
                <span>{t("actions.contact")}</span>
                <Image src="/contact.svg" alt="" width={20} height={20} aria-hidden />
              </Link>
            </PrimaryButton>

            <Link
              href="/faqs"
              className="inline-flex h-[44px] w-full max-w-[180px] items-center justify-center gap-2 rounded-xl bg-white px-6 text-[16px] font-medium shadow-[inset_0_1px_4px_2px_#C2DDFF] sm:w-auto transition-transform hover:scale-105"
            >
              <span className="bg-[linear-gradient(180deg,#006EA8_0%,#005685_100%)] bg-clip-text text-transparent">
                {t("actions.faqs")}
              </span>
              <Image src="/faqs.svg" alt="" width={20} height={20} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
