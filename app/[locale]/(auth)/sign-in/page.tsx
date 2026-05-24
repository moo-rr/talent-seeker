"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useAuth } from "@/hooks/use-auth"
import { useTranslations } from "next-intl"
import { AuthCardWrapper } from "@/features/auth/components/auth-card-wrapper"
import { AuthFieldGroup } from "@/features/auth/components/auth-field-group"
import { AuthUserCompanyTabs } from "@/features/auth/components/auth-user-company-tabs"
import Image from "next/image"
import { Link } from "@/i18n/navigation"

type FormValues = {
  email: string
  password: string
}

export default function SignInPage() {
  const t = useTranslations("Auth.signIn")
  const { signIn, loading, error: authError } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()
  const [error, setError] = useState<string | null>(null)
  const [accountType, setAccountType] = useState<"user" | "company">("user")
  const [showPassword, setShowPassword] = useState(false)

  async function onSubmit(values: FormValues) {
    setError(null)
    try {
      await signIn(values.email, values.password, accountType)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "فشل تسجيل الدخول"
      setError(message)
    }
  }

  return (
    <AuthCardWrapper
      backHref="/"
      backLabel={t("back")}
      logoAlt={t("logoAlt")}
      title={t("title")}
      description={t("description")}
      footerPrefix={t("noAccount")}
      footerActionLabel={t("signUp")}
      footerActionHref="/sign-up"
      topSlot={
        <AuthUserCompanyTabs
          userLabel={t("userTab")}
          companyLabel={t("companyTab")}
          tabListLabel={t("accountTypeTabs")}
          activeTab={accountType}
          onTabChange={setAccountType}
        />
      }
      asideSlot={
        <Link href="/forgot-password" className="text-sm text-white/80 hover:text-white">
          {t("forgotPassword")}
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
        <AuthFieldGroup>
          <div className="space-y-1">
            <label className="flex h-[52px] items-center gap-2 border-b border-white py-4">
              <Image src="/auth/email.svg" alt="" width={20} height={20} aria-hidden />
              <input
                {...register("email", {
                  required: true,
                  pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                })}
                type="email"
                placeholder={t("fields.emailPlaceholder")}
                className="w-full bg-transparent text-base leading-6 text-white placeholder:text-white/60 focus:outline-none"
              />
            </label>
            {errors.email && (
              <span className="text-xs text-red-300">
                {t("fields.emailPlaceholder")} غير صالح
              </span>
            )}
          </div>

          <div className="space-y-1">
            <label className="flex h-[52px] items-center justify-between gap-2 border-b border-white py-4">
              <div className="flex min-w-0 items-center gap-2 flex-1">
                <Image src="/auth/password.svg" alt="" width={20} height={20} aria-hidden />
                <input
                  {...register("password", { required: true, minLength: 6 })}
                  type={showPassword ? "text" : "password"}
                  placeholder={t("fields.passwordPlaceholder")}
                  className="w-full bg-transparent text-base leading-6 text-white placeholder:text-white/60 focus:outline-none"
                />
              </div>
              <button
                type="button"
                className="cursor-pointer shrink-0"
                onClick={() => setShowPassword((p) => !p)}
              >
                <Image src="/auth/eye.svg" alt="" width={20} height={20} aria-hidden />
              </button>
            </label>
            {errors.password && (
              <span className="text-xs text-red-300">
                كلمة المرور يجب أن تكون 6 أحرف على الأقل
              </span>
            )}
          </div>
        </AuthFieldGroup>

        <button
          type="submit"
          className="w-full rounded-md bg-[#40A0CA] py-3 text-white font-semibold shadow-md transition-all hover:bg-[#3490b8] active:translate-y-px disabled:opacity-60 flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>{t("loading")}</span>
            </>
          ) : (
            t("submit")
          )}
        </button>

        {(error || authError) && (
          <div className="mt-2 text-sm text-red-300 bg-red-950/40 border border-red-400/40 rounded-lg px-3 py-2">
            {error || authError}
          </div>
        )}
      </form>
    </AuthCardWrapper>
  )
}
