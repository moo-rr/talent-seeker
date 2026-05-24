import { getLocale } from "next-intl/server"
import { getServices } from "@/lib/api/services/services.service"
import { SectionShell, StaggerInView, StaggerItem } from "@/features/shared-home"
import Image from "next/image"
import { cn } from "@/lib/utils"

export default async function ServicesPage() {
  const locale = await getLocale()
  const services = await getServices(locale)

  const isRTL = locale === "ar"

  // Fallback defaults if API is empty
  const defaultServices = [
    {
      id: 1,
      title: isRTL ? "تجهيز وتعديل السيرة الذاتية" : "CV Preparation & Editing",
      description: isRTL
        ? "نساعدك في صياغة سيرة ذاتية احترافية تتوافق مع المعايير الألمانية (Lebenslauf) لتزيد فرص قبولك."
        : "We help you draft a professional CV that complies with German standards (Lebenslauf) to maximize acceptance.",
      icon: "💼",
    },
    {
      id: 2,
      title: isRTL ? "التقديم وتنسيق المقابلات" : "Job Application & Interview Prep",
      description: isRTL
        ? "نرافقك خطوة بخطوة في التحضير للمقابلات الشخصية مع أصحاب العمل الألمان واجتياز الأسئلة الصعبة."
        : "Step-by-step preparation for personal interviews with German employers and passing difficult questions.",
      icon: "🤝",
    },
    {
      id: 3,
      title: isRTL ? "دعم التأشيرة والانتقال" : "Visa & Relocation Support",
      description: isRTL
        ? "مساعدة كاملة في إنهاء الإجراءات الحكومية واستخراج الفيزا وتسهيل السكن والاستقرار في ألمانيا."
        : "Complete assistance with government procedures, obtaining a visa, and facilitating housing in Germany.",
      icon: "✈️",
    },
  ]

  const displayServices = services.length > 0 ? services : defaultServices

  return (
    <main className="flex-1 bg-[#f8fbff] pb-20">
      {/* Header Block */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#032C44] via-[#006EA8] to-[#41A0CA] py-20 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="relative z-10 mx-auto max-w-[1312px] px-4 text-center sm:px-6 lg:px-[100px]">
          <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/95 backdrop-blur-sm">
            ✦ {isRTL ? "خدماتنا المهنية" : "Our Professional Services"}
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {isRTL ? "نصنع جسر عبورك إلى النجاح" : "Bridging Your Way to Success"}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 leading-relaxed">
            {isRTL
              ? "نقدم باقة متكاملة من الخدمات المهنية المصممة خصيصاً لمساعدتك على الانتقال والعمل في ألمانيا بكل سهولة وأمان."
              : "We offer a complete suite of professional services tailored to help you relocate and work in Germany smoothly and securely."}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <SectionShell stagger={false} className="mt-16">
        <StaggerInView className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {displayServices.map((service, index) => (
            <StaggerItem key={service.id}>
              <div className="group relative flex flex-col h-full justify-between rounded-3xl border border-[#EBF5FB] bg-white p-8 shadow-[0_4px_24px_rgba(0,25,60,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,25,60,0.08)]">
                <div className="space-y-4">
                  {/* Icon */}
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF4FB] text-3xl shadow-inner transition-colors group-hover:bg-[#006EA8] group-hover:text-white">
                    {service.icon || "🌟"}
                  </div>
                  {/* Title */}
                  <h3 className="text-xl font-bold text-[#001222] transition-colors group-hover:text-[#006EA8]">
                    {service.title}
                  </h3>
                  {/* Description */}
                  <p className="text-sm leading-relaxed text-[#526475]">
                    {service.description}
                  </p>
                </div>

                {/* Arrow CTA */}
                <div className="mt-6 flex items-center gap-2 text-sm font-bold text-[#006EA8] group-hover:underline">
                  <span>{isRTL ? "اكتشف المزيد" : "Learn More"}</span>
                  <span className={cn("transition-transform group-hover:translate-x-1", isRTL && "rotate-180 group-hover:-translate-x-1")}>
                    →
                  </span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerInView>
      </SectionShell>
    </main>
  )
}
