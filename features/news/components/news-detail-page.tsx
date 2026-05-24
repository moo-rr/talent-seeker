import Image from "next/image"
import { notFound } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { getNewsItem } from "@/lib/api/services/news.service"
import { getNewsForLocale } from "@/features/news/lib/news-fallback"
import { formatNewsDate } from "@/features/news/lib/format-news-date"
import { resolveNewsImageUrl } from "@/features/news/lib/resolve-news-image"
import { NewsCalendarIcon, NewsEyebrowGlobe } from "@/features/news/components/news-icons"
import { NewsDetailSidebar } from "@/features/news/components/news-detail-sidebar"
import { RelatedNewsCard } from "@/features/news/components/related-news-card"
import { JobDetailShare } from "@/features/jobs/components/job-detail-share"

type NewsDetailPageProps = {
  slug: string
}

function renderArticleContent(content: string) {
  if (content.includes("<") && content.includes(">")) {
    return (
      <div
        className="prose prose-neutral max-w-none text-[16px] leading-[1.5] text-[#525252] [&_h2]:mt-8 [&_h2]:text-[24px] [&_h2]:font-bold [&_h2]:text-[#171717] [&_li]:mb-2 [&_ol]:list-decimal [&_ol]:ps-6 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:ps-6"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  return content.split(/\n{2,}/).map((paragraph, index) => (
    <p key={index} className="text-[16px] leading-[1.5] text-[#525252]">
      {paragraph.trim()}
    </p>
  ))
}

export async function NewsDetailPage({ slug }: NewsDetailPageProps) {
  const locale = await getLocale()
  const isRtl = locale === "ar"
  const newsT = await getTranslations("Landing.news")
  const pageT = await getTranslations("Landing.newsPage")

  let article = await getNewsItem(slug, locale)

  if (!article) {
    const fallbackItems = await getNewsForLocale(locale, newsT)
    article = fallbackItems.find((item) => item.slug === slug) ?? null
  }

  if (!article) {
    notFound()
  }

  const allNews = await getNewsForLocale(locale, newsT, { per_page: 12 })
  const related = allNews.filter((item) => item.slug !== slug).slice(0, 6)

  const detailSections = [
    { title: pageT("content.sectionOneTitle"), body: pageT("content.sectionOneBody") },
    { title: pageT("content.sectionTwoTitle"), body: pageT("content.sectionTwoBody") },
    { title: pageT("content.sectionThreeTitle"), body: pageT("content.sectionThreeBody") },
    { title: pageT("content.sectionFourTitle"), body: pageT("content.sectionFourBody") },
  ]

  const hasRichContent = article.content.length > article.excerpt.length + 20
  const heroSrc = resolveNewsImageUrl(article.image, 0)
  const heroRemote = heroSrc.startsWith("http")

  return (
    <div className="bg-white pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-[71px] lg:pb-[82px]">
      <div className="mx-auto max-w-[1312px] px-4 sm:px-6 lg:px-8">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-[14px] font-medium text-[#006EA8] hover:underline"
        >
          <span aria-hidden>{isRtl ? "→" : "←"}</span> {pageT("backToNews")}
        </Link>

        <div className="mt-10 flex flex-col gap-12 lg:mt-12 lg:flex-row lg:items-start lg:gap-10 xl:gap-12">
          <article className="min-w-0 flex-1 lg:max-w-[867px]">
            <div className="flex flex-col gap-12">
              <div className="relative aspect-[867/600] w-full overflow-hidden rounded-[16px] bg-[#E8F2FF]">
                <Image
                  src={heroSrc}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 867px"
                  unoptimized={heroRemote}
                />
              </div>

              <div className="flex flex-col gap-8">
                <div className="inline-flex items-center gap-2 rounded-lg bg-[rgba(64,160,202,0.25)] px-4 py-2 text-[12px] leading-[1.16] text-[#002B46] w-fit">
                  <NewsEyebrowGlobe />
                  {newsT("eyebrow")}
                </div>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
                  <h1 className="text-[24px] font-bold leading-[1.16] text-[#171717] sm:text-[28px]">
                    {article.title}
                  </h1>
                  <p className="inline-flex shrink-0 items-center gap-2 text-[16px] font-medium leading-[1.16] text-[#525252]">
                    <NewsCalendarIcon className="h-6 w-6 text-[#40A0CA]" />
                    {formatNewsDate(article.published_at, locale)}
                  </p>
                </div>

                <div className="space-y-6 text-start">
                  {article.excerpt ? (
                    <p className="text-[16px] font-medium leading-[1.5] text-[#171717]">
                      {article.excerpt}
                    </p>
                  ) : null}

                  {hasRichContent ? (
                    <div className="space-y-4">{renderArticleContent(article.content)}</div>
                  ) : (
                    <div className="space-y-6">
                      <p className="text-[16px] leading-[1.5] text-[#525252]">
                        {pageT("content.opening")}
                      </p>
                      {detailSections.map((section) => (
                        <div key={section.title} className="space-y-3">
                          <h2 className="text-[20px] font-bold leading-[1.16] text-[#171717]">
                            {section.title}
                          </h2>
                          <p className="text-[16px] leading-[1.5] text-[#525252]">
                            {section.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <JobDetailShare label={pageT("shareWith")} />
              </div>
            </div>
          </article>

          <NewsDetailSidebar
            related={related}
            locale={locale}
            title={pageT("relatedTitle")}
          />
        </div>

        {related.length > 0 ? (
          <section className="mt-14 border-t border-[#E8F2FF] pt-10 lg:hidden">
            <h2 className="text-[28px] font-semibold leading-[1.5] text-[#002B46]">
              {pageT("relatedTitle")}
            </h2>
            <div className="mt-8 flex flex-col gap-6">
              {related.slice(0, 4).map((item, index) => (
                <RelatedNewsCard key={item.id} item={item} locale={locale} imageIndex={index + 1} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
