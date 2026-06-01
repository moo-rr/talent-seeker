"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getUserPortfolio, uploadCV } from "@/lib/api/services/portfolio.service"
import type { UserPortfolio } from "@/lib/api/types"
import { Input } from "@/components/ui/input"

type Props = {
  locale: string
  initialPortfolio?: UserPortfolio
}

export default function UserEducationClient({ locale, initialPortfolio }: Props) {
  const { loading } = useAuth()
  const [portfolio, setPortfolio] = useState<UserPortfolio>(initialPortfolio ?? {})
  const [fetching, setFetching] = useState(!initialPortfolio)
  const [message, setMessage] = useState("")
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function loadPortfolio() {
      if (initialPortfolio) return
      setFetching(true)
      try {
        // attempt to fetch via client API route
        const res = await fetch("/api/user/portfolio", { headers: { "x-locale": locale } })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.message || "Failed to load portfolio data")
        if (mounted) setPortfolio(data || {})
      } catch (err) {
        if (mounted) setMessage(err instanceof Error ? err.message : "Failed to load portfolio data")
      } finally {
        if (mounted) setFetching(false)
      }
    }
    loadPortfolio()
    return () => {
      mounted = false
    }
  }, [initialPortfolio, locale])

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const form = new FormData()
      form.append("cv", file)

      const res = await fetch("/api/user/cv", { method: "POST", body: form, headers: { "x-locale": locale } })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || "Failed to upload CV")

      // If the server returns cv_url, use it
      if (data?.cv_url) {
        setPortfolio((prev) => ({ ...prev, cv_url: data.cv_url }))
        setMessage(locale === "ar" ? "تم رفع السيرة الذاتية بنجاح" : "CV uploaded successfully")
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : (locale === "ar" ? "فشل رفع السيرة الذاتية" : "Failed to upload CV"))
    } finally {
      setUploading(false)
    }
  }

  const isAr = locale === "ar"

  return (
    <div className="w-full space-y-6">
      {/* CV Section */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">{isAr ? "السيرة الذاتية" : "CV"}</h2>
          <label>
            <input
              accept=".pdf,.doc,.docx"
              onChange={handleCVUpload}
              type="file"
              className="hidden"
              disabled={uploading}
            />
            <span className="inline-flex items-center justify-center px-4 py-2 bg-[#006EA8] text-white text-xs sm:text-sm rounded-full cursor-pointer hover:bg-[#005685] transition disabled:opacity-60">
              {uploading ? (isAr ? "جاري الرفع..." : "Uploading...") : (isAr ? "اضف جديد" : "Add New")}
            </span>
          </label>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
            {message}
          </div>
        )}

        {portfolio.cv_url ? (
          <div className="rounded-lg border-2 border-dashed border-[#40A0CA] bg-[#F4FAFF] p-6 text-center">
            <div className="text-4xl mb-2">📄</div>
            <p className="text-sm text-[#0F172A] font-medium mb-3">{isAr ? "السيرة الذاتية: تم الرفع" : "CV: Document uploaded"}</p>
            <a
              href={portfolio.cv_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
            >
              {isAr ? "تحميل" : "Download"}
            </a>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-[#40A0CA] bg-[#F4FAFF] p-6 text-center">
            <div className="text-4xl mb-2">📄</div>
            <p className="text-sm text-[#6B7280]">{isAr ? "اسحب السيرة الذاتية هنا أو ارفعها" : "Drop your CV here or Upload"}</p>
            <p className="text-xs text-[#9CA3AF] mt-1">{isAr ? "يدعم PDF" : "Support PDF"}</p>
          </div>
        )}
      </div>

      {/* Language Section */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">{isAr ? "اللغات" : "Language"}</h2>
          <button className="px-4 py-2 bg-[#006EA8] text-white text-xs sm:text-sm rounded-full hover:bg-[#005685] transition">
            {isAr ? "اضف جديد" : "Add New"}
          </button>
        </div>

        {portfolio.languages && portfolio.languages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {portfolio.languages.map((lang) => (
              <div
                key={lang.id}
                className="p-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]"
              >
                <h3 className="font-medium text-[#111827]">{lang.name}</h3>
                <p className="text-sm text-[#6B7280] mt-1">
                  {lang.proficiency === "native"
                    ? (isAr ? "لغة أم أو ثنائية" : "Native or Bilingual")
                    : lang.proficiency === "fluent"
                      ? (isAr ? "محادثة" : "Conversational")
                      : lang.proficiency}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#6B7280]">{isAr ? "لا توجد لغات مضافة" : "No languages added yet"}</p>
        )}
      </div>

      {/* Education Section */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">{isAr ? "المؤهلات" : "Education"}</h2>
          <button className="px-4 py-2 bg-[#006EA8] text-white text-xs sm:text-sm rounded-full hover:bg-[#005685] transition">
            {isAr ? "اضف جديد" : "Add New"}
          </button>
        </div>

        {portfolio.educations && portfolio.educations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolio.educations.map((edu) => (
              <div
                key={edu.id}
                className="p-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]"
              >
                <h3 className="font-bold text-[#111827]">{edu.degree}</h3>
                <p className="text-sm text-[#6B7280] mt-1">{edu.institution}</p>
                <p className="text-xs text-[#9CA3AF] mt-2">
                  {new Date(edu.start_date).getFullYear()}
                  {edu.end_date ? ` - ${new Date(edu.end_date).getFullYear()}` : ` - ${isAr ? "الحالي" : "Present"}`}
                </p>
                {edu.grade && (
                  <p className="text-sm text-[#111827] mt-2 font-medium">
                    {isAr ? "التقدير:" : "Grade:"} {edu.grade}%
                  </p>
                )}
                {edu.document_url && (
                  <a
                    href={edu.document_url}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium mt-3 inline-block underline"
                  >
                    {isAr ? "عرض الشهادة" : "View Certificate"}
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#6B7280]">{isAr ? "لا توجد مؤهلات مضافة حتى الآن" : "No education records added yet"}</p>
        )}
      </div>

      {/* Work Experience Section */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">{isAr ? "الخبرات العملية" : "Work Experience"}</h2>
          <button className="px-4 py-2 bg-[#006EA8] text-white text-xs sm:text-sm rounded-full hover:bg-[#005685] transition">
            {isAr ? "اضف جديد" : "Add New"}
          </button>
        </div>

        {portfolio.experiences && portfolio.experiences.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolio.experiences.map((exp) => (
              <div
                key={exp.id}
                className="p-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]"
              >
                <h3 className="font-bold text-[#111827]">{exp.job_title}</h3>
                <p className="text-sm text-[#6B7280] mt-1">{exp.company}</p>
                <p className="text-xs text-[#9CA3AF] mt-2">
                  {new Date(exp.start_date).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  {exp.is_current
                    ? `- ${isAr ? "الحالي" : "Present"}`
                    : exp.end_date
                      ? `- ${new Date(exp.end_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                      : ""}
                </p>
                {exp.location && (
                  <p className="text-xs text-[#6B7280] mt-2">{exp.location}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#6B7280]">{isAr ? "لا توجد خبرات عملية" : "No work experience added yet"}</p>
        )}
      </div>

      {/* Skills Section */}
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">{isAr ? "المهارات" : "Skills"}</h2>
          <button className="px-4 py-2 bg-[#006EA8] text-white text-xs sm:text-sm rounded-full hover:bg-[#005685] transition">
            {isAr ? "اضف جديد" : "Add New"}
          </button>
        </div>

        {portfolio.skills && portfolio.skills.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {portfolio.skills.map((skill) => (
              <span
                key={skill.id}
                className="px-4 py-2 rounded-full border border-[#006EA8] text-[#006EA8] text-sm font-medium hover:bg-[#F0F9FF] transition"
              >
                {skill.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#6B7280]">{isAr ? "لا توجد مهارات" : "No skills added yet"}</p>
        )}
      </div>
    </div>
  )
}
