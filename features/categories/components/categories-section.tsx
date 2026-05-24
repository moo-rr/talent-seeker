import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getTranslations } from "next-intl/server"
import { SectionShell, StaggerInView, StaggerItem } from "@/features/shared-home"
import { getCategoryKeys } from "@/features/categories/services/categories.service"
import { CategoryIconFor } from "@/features/categories/components/category-icons"
import { cn } from "@/lib/utils"
import { Globe, MoveUpRight } from "lucide-react"

const CARD_HOVER_SHADOW =
  "hover:border-[#4BB7E7] hover:bg-[url('/contact/button-noise.png'),linear-gradient(180deg,#006EA8_0%,#005685_100%)] hover:bg-size-[150px_150px,auto] hover:bg-blend-[plus-lighter,normal] hover:text-white hover:shadow-[0_0_0_5px_#FFFFFF,0_0_0_4px_#C2E3FA,0_4px_5px_rgba(75,183,231,0.15),0_10px_13px_rgba(75,183,231,0.22),0_24px_32px_rgba(75,183,231,0.19)]"

export async function CategoriesSection() {
  const t = await getTranslations("Landing.categories")
  const categories = getCategoryKeys()

  return (
    <SectionShell id="categories" stagger={false} className="overflow-visible bg-white py-12 sm:py-16 lg:py-[82px]">
      <div className="flex flex-col gap-10 lg:gap-16">
        <StaggerInView className="flex flex-col items-start gap-6 text-start" immediate>
          <StaggerItem immediate>
            <div className="inline-flex items-center gap-2 rounded-lg bg-[rgba(64,160,202,0.25)] px-4 py-2 text-[12px] leading-[1.16] font-normal text-[#40A0CA]">
              <Globe className="h-4 w-4 shrink-0 text-[#40A0CA]" strokeWidth={1.5} />
              {t("eyebrow")}
            </div>
          </StaggerItem>
          <div className="flex flex-col gap-6">
            <StaggerItem immediate>
              <h2 className="max-w-[683px] font-heading text-[28px] font-bold capitalize leading-[1.5] text-[#171717] sm:text-[32px] lg:text-[36px]">
                {t("title")}
              </h2>
            </StaggerItem>
            <StaggerItem immediate>
              <p className="max-w-[1312px] text-[14px] font-normal leading-[1.16] text-[#525252] sm:text-[16px]">
                {t("description")}
              </p>
            </StaggerItem>
          </div>
        </StaggerInView>

        <StaggerInView className="overflow-visible" immediate>
          <div className="grid grid-cols-1 gap-6 overflow-visible sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((key) => (
              <StaggerItem key={key} immediate className="overflow-visible p-1">
                <Card
                  className={cn(
                    "group relative min-h-[236px] cursor-pointer overflow-visible rounded-lg border border-[#d4d4d4] bg-white transition-all duration-300",
                    CARD_HOVER_SHADOW
                  )}
                >
                  <CardContent className="flex h-full min-h-[236px] flex-col items-start gap-6 overflow-visible px-6 py-8">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-visible rounded-full border border-[#40A0CA] bg-white transition-colors group-hover:border-white group-hover:bg-white">
                      <CategoryIconFor
                        categoryKey={key}
                        className="text-[#40A0CA] transition-colors group-hover:text-[#2D7494]"
                      />
                    </div>
                    <div className="mt-auto space-y-2 text-start">
                      <p className="text-[20px] font-bold leading-[1.16] text-[#262626] transition-colors group-hover:text-white">
                        {t(`items.${key}.label`)}
                      </p>
                      <p className="text-[12px] font-medium leading-[1.16] text-[#525252] transition-colors group-hover:text-[#FAFAFA]">
                        {t(`items.${key}.vacancy`)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}

            <StaggerItem immediate className="overflow-visible p-1 sm:col-span-2 lg:col-span-1">
              <Card className="min-h-[236px] overflow-visible rounded-lg border border-[#4BB7E7] bg-[url('/contact/button-noise.png'),linear-gradient(180deg,#398DB3_0%,#2D7494_100%)] bg-size-[150px_150px,auto] bg-blend-[plus-lighter,normal] text-white shadow-[0_0_0_5px_#FFFFFF,0_0_0_4px_#C2E3FA,0_4px_5px_rgba(75,183,231,0.15),0_10px_13px_rgba(75,183,231,0.22),0_24px_32px_rgba(75,183,231,0.19)]">
                <CardContent className="flex h-full min-h-[236px] flex-col justify-between gap-4 overflow-visible px-6 py-6">
                  <div className="space-y-4 text-start">
                    <p className="text-[48px] font-medium leading-[1.16] sm:text-[64px]">13k+</p>
                    <p className="text-[16px] font-normal capitalize leading-[1.16]">{t("metricLabel")}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="h-10 w-full justify-between rounded-xl border-white/40 bg-transparent px-4 text-[16px] font-medium text-white shadow-[0_0_0_4px_#E8F2FF,0_0_0_5px_#FFFFFF,inset_0_1px_18px_2px_#E8F2FF,inset_0_1px_4px_2px_#C2DDFF] hover:bg-white/10 hover:text-white"
                  >
                    {t("showMore")}
                    <MoveUpRight className="h-5 w-5 shrink-0 rtl:-scale-x-100" />
                  </Button>
                </CardContent>
              </Card>
            </StaggerItem>
          </div>
        </StaggerInView>
      </div>
    </SectionShell>
  )
}
