"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { useAuth } from "@/hooks/use-auth"
import { AuthFieldGroup } from "./auth-field-group"
import { AuthTelInput } from "./auth-tel-input"
import { useLocale } from "next-intl"
import { cn } from "@/lib/utils"

type FormValues = {
  name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
  company_name?: string
  accept_terms: boolean
  country_id: string
}

type Props = {
  userTabLabel: string
  companyTabLabel: string
  tabListLabel: string
  fullNamePlaceholder: string
  emailPlaceholder: string
  passwordPlaceholder: string
  phonePlaceholder?: string
  confirmPasswordPlaceholder?: string
  companyNamePlaceholder?: string
  termsLabel?: string
  showPasswordLabel: string
  hidePasswordLabel: string
  submitLabel: string
}

type CountryOption = {
  id: number
  name: string
  code: string
  flag?: string
}

export function SignUpTabForm({
  userTabLabel,
  companyTabLabel,
  tabListLabel,
  fullNamePlaceholder,
  emailPlaceholder,
  passwordPlaceholder,
  phonePlaceholder = "Phone",
  confirmPasswordPlaceholder = "Confirm password",
  companyNamePlaceholder = "Company name",
  termsLabel = "I accept the terms and privacy policy",
  showPasswordLabel,
  hidePasswordLabel,
  submitLabel,
}: Props) {
  const [activeTab, setActiveTab] = useState<"user" | "company">("user")
  const [showPassword, setShowPassword] = useState(false)
  const [countries, setCountries] = useState<CountryOption[]>([])
  const { signUp, loading, error } = useAuth()
  const locale = useLocale()
  const isRTL = locale === "ar"

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { accept_terms: true },
  })

  // Fetch countries
  useEffect(() => {
    async function loadCountries() {
      try {
        const res = await fetch(`/api/countries?locale=${locale}`)
        const json = await res.json()
        if (json && Array.isArray(json.data)) {
          setCountries(json.data)
        }
      } catch (err) {
        console.error("Error loading countries:", err)
      }
    }
    loadCountries()
  }, [locale])

  const acceptTerms = watch("accept_terms")
  const password = watch("password")
  const passwordConfirmation = watch("password_confirmation")

  // Password confirmation check
  const passwordsMatch = password === passwordConfirmation

  const baseTabClassName =
    "inline-flex h-[48px] min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200 sm:h-[52px] sm:flex-none sm:w-[min(227px,48%)] sm:px-4 sm:text-base"
  const activeTabClassName =
    "border-[#9fc9e6] bg-gradient-to-b from-[#006ea8] to-[#005685] text-white shadow-[0_8px_24px_rgba(0,110,168,0.35)]"
  const inactiveTabClassName =
    "border-[#6b87a2] bg-[#02223b]/65 text-[#d9eef9] hover:bg-[#033a62]/70"

  async function onSubmit(values: FormValues) {
    if (!passwordsMatch) return
    if (!values.accept_terms) return

    const displayName =
      activeTab === "company" && values.company_name
        ? values.company_name
        : values.name

    await signUp({
      name: displayName,
      email: values.email,
      phone: values.phone,
      password: values.password,
      password_confirmation: values.password_confirmation,
      type: activeTab,
      company_name: activeTab === "company" ? values.company_name : undefined,
      country_id: values.country_id ? Number(values.country_id) : 1,
      accept_terms_and_privacy: values.accept_terms,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
      <div role="tablist" aria-label={tabListLabel} className="flex w-full gap-3 sm:gap-4">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "user"}
          onClick={() => setActiveTab("user")}
          className={`${baseTabClassName} ${activeTab === "user" ? activeTabClassName : inactiveTabClassName}`}
        >
          <Image src="/auth/user.svg" alt="" width={24} height={24} className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
          <span>{userTabLabel}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "company"}
          onClick={() => setActiveTab("company")}
          className={`${baseTabClassName} ${activeTab === "company" ? activeTabClassName : inactiveTabClassName}`}
        >
          <Image src="/auth/company.svg" alt="" width={24} height={24} className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
          <span>{companyTabLabel}</span>
        </button>
      </div>

      <p className="text-center text-xs text-[#9fc9e6] sm:text-sm">
        {activeTab === "user" ? userTabLabel : companyTabLabel}
      </p>

      <AuthFieldGroup>
        {activeTab === "company" && (
          <div className="space-y-1">
            <label className="flex h-[52px] items-center gap-2 border-b border-white py-4">
              <Image src="/auth/company.svg" alt="" width={20} height={20} aria-hidden />
              <input
                {...register("company_name", { required: activeTab === "company" })}
                placeholder={companyNamePlaceholder}
                className="w-full bg-transparent text-base text-white placeholder:text-white/60 focus:outline-none"
              />
            </label>
            {errors.company_name && (
              <span className="text-xs text-red-300">
                {isRTL ? "اسم الشركة مطلوب" : "Company name is required"}
              </span>
            )}
          </div>
        )}

        <div className="space-y-1">
          <label className="flex h-[52px] items-center gap-2 border-b border-white py-4">
            <Image src="/auth/user.svg" alt="" width={20} height={20} aria-hidden />
            <input
              {...register("name", { required: true })}
              placeholder={fullNamePlaceholder}
              className="w-full bg-transparent text-base text-white placeholder:text-white/60 focus:outline-none"
            />
          </label>
          {errors.name && (
            <span className="text-xs text-red-300">
              {isRTL ? "الاسم مطلوب" : "Name is required"}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <label className="flex h-[52px] items-center gap-2 border-b border-white py-4">
            <Image src="/auth/email.svg" alt="" width={20} height={20} aria-hidden />
            <input
              {...register("email", {
                required: true,
                pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              })}
              type="email"
              placeholder={emailPlaceholder}
              className="w-full bg-transparent text-base text-white placeholder:text-white/60 focus:outline-none"
            />
          </label>
          {errors.email && (
            <span className="text-xs text-red-300">
              {isRTL ? "البريد الإلكتروني غير صالح" : "Invalid email address"}
            </span>
          )}
        </div>

        {/* Country Selector */}
        <div className="space-y-1">
          <label className="flex h-[52px] items-center gap-2 border-b border-white py-4 text-white">
            <span className="text-xl">🌐</span>
            <select
              {...register("country_id", { required: true })}
              className="w-full bg-transparent text-base text-white focus:outline-none [&_option]:bg-[#041d33] [&_option]:text-white"
            >
              <option value="" disabled hidden>
                {isRTL ? "اختر الدولة" : "Select Country"}
              </option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {errors.country_id && (
            <span className="text-xs text-red-300">
              {isRTL ? "يرجى اختيار الدولة" : "Please select country"}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <AuthTelInput
            {...register("phone", { required: true })}
            placeholder={phonePlaceholder}
          />
          {errors.phone && (
            <span className="text-xs text-red-300">
              {isRTL ? "رقم الهاتف مطلوب" : "Phone number is required"}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <label className="flex h-[52px] items-center justify-between gap-2 border-b border-white py-4">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Image src="/auth/password.svg" alt="" width={20} height={20} aria-hidden />
              <input
                {...register("password", { required: true, minLength: 6 })}
                type={showPassword ? "text" : "password"}
                placeholder={passwordPlaceholder}
                className="w-full bg-transparent text-base text-white placeholder:text-white/60 focus:outline-none"
              />
            </div>
            <button
              type="button"
              className="shrink-0 cursor-pointer"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? hidePasswordLabel : showPasswordLabel}
            >
              <Image src="/auth/eye.svg" alt="" width={20} height={20} aria-hidden />
            </button>
          </label>
          {errors.password && (
            <span className="text-xs text-red-300">
              {isRTL
                ? "يجب أن تكون كلمة المرور 6 أحرف على الأقل"
                : "Password must be at least 6 characters"}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <label className="flex h-[52px] items-center gap-2 border-b border-white py-4">
            <Image src="/auth/password.svg" alt="" width={20} height={20} aria-hidden />
            <input
              {...register("password_confirmation", { required: true })}
              type={showPassword ? "text" : "password"}
              placeholder={confirmPasswordPlaceholder}
              className="w-full bg-transparent text-base text-white placeholder:text-white/60 focus:outline-none"
            />
          </label>
          {passwordConfirmation && !passwordsMatch && (
            <span className="text-xs text-red-300">
              {isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match"}
            </span>
          )}
        </div>
      </AuthFieldGroup>

      <label className="flex items-start gap-2 text-sm text-white/90">
        <input
          type="checkbox"
          {...register("accept_terms", { required: true })}
          className="mt-1 h-4 w-4 shrink-0 accent-[#40A0CA]"
        />
        <span>{termsLabel}</span>
      </label>

      {error && (
        <div className="rounded-lg border border-red-400/40 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !acceptTerms || !passwordsMatch}
        className="w-full rounded-md bg-[#40A0CA] py-3 font-semibold text-white shadow-md transition-all hover:bg-[#3490b8] active:translate-y-px disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{isRTL ? "جاري التسجيل..." : "Registering..."}</span>
          </>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  )
}
