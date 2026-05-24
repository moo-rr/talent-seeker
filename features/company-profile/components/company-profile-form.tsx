"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState, useSyncExternalStore, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useLocale } from "next-intl";
import { Camera, Globe, ChevronDown, Eye, EyeOff } from "lucide-react";
import { PrimaryButton } from "@/components/ui/primary-button";
import { toast } from "sonner";

// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faLinkedin,
  faTwitter,
  faPinterest,
} from "@fortawesome/free-brands-svg-icons";

// ============================================================================
// Types
// ============================================================================
type CountryData = { id: number; name: string; code: string };
type CityData = { id: number; name: string };
type CompanyTypeData = { id: number; name: string };

type ProfileFormValues = {
  name: string;
  ceo_name: string;
  email: string;
  website: string;
  country_id: string;
  city_id: string;
  phone: string;
  dial_code: string;
  postal_code: string;
  num_of_employees: string;
  company_type_id: string;
  description: string;
  new_password?: string;
  confirm_password?: string;
  facebook?: string;
  linkedin?: string;
  twitter_x?: string;
  pinterest?: string;
};

type InitialProfileData = {
  name?: string
  email?: string
  phone?: string
  company_name?: string | Record<string, unknown>
  country_id?: number
  country?: { id?: number }
  city?: { id?: number } | number
  avatar?: string | null
  cover_image?: string | null
  company_type?: { id?: number }
  company_type_id?: number | string
  ceo_name?: string | Record<string, unknown>
  description?: string | Record<string, unknown>
  postal_code?: string
  num_of_employees?: number
  facebook?: string
  linkedin?: string
  twitter_x?: string
  pinterest?: string
  website?: string
}

const DIALING_CODES = [
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+20", country: "EG", flag: "🇪🇬" },
  { code: "+212", country: "MA", flag: "🇲🇦" },
  { code: "+962", country: "JO", flag: "🇯🇴" },
  { code: "+967", country: "YE", flag: "🇾🇪" },
  { code: "+966", country: "SA", flag: "🇸🇦" },
  { code: "+971", country: "AE", flag: "🇦🇪" },
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "GB", flag: "🇬🇧" },
];

// ============================================================================
// Styles
// ============================================================================
const fieldBase =
  "w-full border-b border-[#D4D4D4] py-2.5 text-sm text-[#525252] bg-transparent outline-none transition-colors focus:border-[#40A0CA] placeholder:text-[#A3A3A3]";

const selectBase =
  "w-full border-b border-[#D4D4D4] py-2.5 text-sm text-[#525252] bg-transparent outline-none transition-colors focus:border-[#40A0CA] appearance-none cursor-pointer";

// ============================================================================
// Main Component
// ============================================================================
export default function CompanyProfileForm({ initialProfile }: { initialProfile?: InitialProfileData }) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      dial_code: "+20",
    },
  });

  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [cities, setCities] = useState<CityData[]>([]);
  const [companyTypes, setCompanyTypes] = useState<CompanyTypeData[]>([]);

  // Images
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Password visibility
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const selectedCountryId = watch("country_id");
  const selectedDialCode = watch("dial_code");

  // --------------------------------------------------------------------------
  // Load initial data and hydrate form from server-provided initialProfile
  // --------------------------------------------------------------------------
  useEffect(() => {
    let active = true;

    const loadMetadata = async () => {
      try {
        const [countriesRes, companyTypesRes] = await Promise.all([
          fetch(`/api/countries?locale=${locale}`).then((r) => r.json()),
          fetch(`/api/company-types?locale=${locale}`).then((r) => r.json()),
        ]);
        if (!active) return;
        if (countriesRes.data) setCountries(countriesRes.data);
        if (companyTypesRes.data) setCompanyTypes(companyTypesRes.data);
      } catch (err) {
        console.error("Failed to load metadata", err);
      }
    };

    loadMetadata();

    if (initialProfile) {
      const p = initialProfile as InitialProfileData;

      const companyName = String(
        typeof p.company_name === "string"
          ? p.company_name
          : (p.company_name && (p.company_name as Record<string, unknown>)[locale]) ||
              (p.company_name && (p.company_name as Record<string, unknown>).ar) ||
              (p.company_name && (p.company_name as Record<string, unknown>).en) ||
              ""
      );

      const ceoName = String(
        typeof p.ceo_name === "string"
          ? p.ceo_name
          : (p.ceo_name && (p.ceo_name as Record<string, unknown>)[locale]) ||
              (p.ceo_name && (p.ceo_name as Record<string, unknown>).ar) ||
              (p.ceo_name && (p.ceo_name as Record<string, unknown>).en) ||
              ""
      );

      const descriptionText = String(
        typeof p.description === "string"
          ? p.description
          : (p.description && (p.description as Record<string, unknown>)[locale]) ||
              (p.description && (p.description as Record<string, unknown>).ar) ||
              (p.description && (p.description as Record<string, unknown>).en) ||
              ""
      );
      const rawCompanyTypeId = (p as { company_type_id?: number | string }).company_type_id
      const companyTypeId = p.company_type?.id ?? rawCompanyTypeId

      setValue("name", companyName);
      setValue("ceo_name", ceoName);
      setValue("email", p.email || "");
      setValue("website", p.website || "");
      setValue("postal_code", p.postal_code || "");
      setValue("num_of_employees", String(p.num_of_employees || ""));
      setValue("company_type_id", String(companyTypeId ?? ""));
      setValue("description", descriptionText);

      const countryId = p.country_id ?? (p.country && typeof p.country === "object" ? (p.country as { id?: number }).id : undefined) ?? "";
      setValue("country_id", String(countryId));

      const cityId = p.city ? (typeof p.city === "object" ? (p.city as { id?: number }).id : p.city) : "";
      if (countryId) {
        fetch(`/api/cities?countryId=${countryId}&locale=${locale}`)
          .then((r) => r.json())
          .then((cData) => {
            if (active && cData.data) {
              setCities(cData.data);
              setValue("city_id", String(cityId));
            }
          });
      }

      // Phone & dial code
      const rawPhone = p.phone || "";
      let parsedPhone = rawPhone;
      let parsedDial = "+20";
      for (const d of DIALING_CODES) {
        if (rawPhone.startsWith(d.code)) {
          parsedDial = d.code;
          parsedPhone = rawPhone.slice(d.code.length);
          break;
        }
      }
      setValue("dial_code", parsedDial);
      setValue("phone", parsedPhone);

      // Socials
      setValue("facebook", p.facebook || "");
      setValue("linkedin", p.linkedin || "");
      setValue("twitter_x", p.twitter_x || "");
      setValue("pinterest", p.pinterest || "");

      setAvatarUrl(p.avatar || null);
      setCoverUrl(p.cover_image || null);
    }

    return () => {
      active = false;
    };
  }, [setValue, locale, initialProfile]);

  // Load cities when country changes
  useEffect(() => {
    if (!selectedCountryId) {
      setCities([]);
      return;
    }
    let active = true;
    fetch(`/api/cities?countryId=${selectedCountryId}&locale=${locale}`)
      .then((r) => r.json())
      .then((cData) => {
        if (active && cData.data) setCities(cData.data);
      })
      .catch(console.error);
    return () => {
      active = false;
    };
  }, [selectedCountryId, locale]);

  // --------------------------------------------------------------------------
  // Submit handler
  // --------------------------------------------------------------------------
  const onSubmit = useCallback(
    async (data: ProfileFormValues) => {
      setMessage(null);
      setErrorMsg(null);
      setLoading(true);

      try {
        if (data.new_password && data.new_password !== data.confirm_password) {
          throw new Error(isAr ? "كلمتا المرور غير متطابقتين" : "Passwords do not match");
        }

        const fd = new FormData();
        if (avatarFile) fd.append("avatar", avatarFile);
        if (coverFile) fd.append("cover_image", coverFile);

        fd.append("name", data.name);
        fd.append("website", data.website);
        fd.append("country_id", data.country_id);
        fd.append("city_id", data.city_id);
        fd.append("postal_code", data.postal_code);
        fd.append("num_of_employees", data.num_of_employees);
        fd.append("company_type_id", data.company_type_id);
        fd.append("phone", `${data.dial_code}${data.phone}`);

        // Localized fields
        fd.append("company_name[ar]", data.name);
        fd.append("company_name[en]", data.name);
        fd.append("company_name[de]", data.name);
        fd.append("ceo_name[ar]", data.ceo_name);
        fd.append("ceo_name[en]", data.ceo_name);
        fd.append("ceo_name[de]", data.ceo_name);
        fd.append("description[ar]", data.description);
        fd.append("description[en]", data.description);
        fd.append("description[de]", data.description);

        fd.append("facebook", data.facebook || "");
        fd.append("linkedin", data.linkedin || "");
        fd.append("twitter_x", data.twitter_x || "");
        fd.append("pinterest", data.pinterest || "");

        const res = await fetch("/api/auth/profile", { method: "POST", body: fd });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.message || "Failed to update profile");

        if (data.new_password) {
          const pwRes = await fetch("/api/auth/profile/password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              current_password: "",
              new_password: data.new_password,
              new_password_confirmation: data.confirm_password,
            }),
          });
          const pwPayload = await pwRes.json();
          if (!pwRes.ok) throw new Error(pwPayload?.message || "Failed to update password");
        }

        const successMsg = isAr ? "تم حفظ التعديلات بنجاح" : "Profile changes saved successfully";
        setMessage(successMsg);
        toast.success(successMsg);
      } catch (err: unknown) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : (isAr ? "حدث خطأ غير متوقع" : "An unexpected error occurred");
        setErrorMsg(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [avatarFile, coverFile, isAr]
  );

  // File handlers
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverUrl(URL.createObjectURL(file));
    }
  };

  const activeDialObj = DIALING_CODES.find((d) => d.code === selectedDialCode) || DIALING_CODES[0];

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className="w-full flex flex-col gap-6" dir={isAr ? "rtl" : "ltr"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* ==================== COMPANY BASIC INFO CARD ==================== */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden shadow-sm">
          <div className="px-8 pt-8 pb-4">
            <h2
              className="text-[22px] font-bold italic text-start"
              style={{
                background: "linear-gradient(270deg, #032C44 0%, #41A0CA 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {isAr ? "بيانات الشركة الأساسية" : "Company Basic Info"}
            </h2>
          </div>

          {/* Cover + Avatar */}
          <div className="px-8">
            <div className="relative w-full rounded-xl overflow-hidden" style={{ height: "260px" }}>
              {coverUrl ? (
                <img src={coverUrl} alt="Cover Banner" className="h-full w-full object-cover" />
              ) : (
                <div
                  className="h-full w-full flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #0a1628 0%, #1a3a5c 40%, #2a4a6c 60%, #1a3a5c 100%)",
                  }}
                >
                  {/* City skyline placeholder SVG (اختصاراً) */}
                  <svg
                    viewBox="0 0 800 260"
                    className="absolute inset-0 w-full h-full opacity-30"
                    preserveAspectRatio="xMidYMax slice"
                  >
                    <defs>
                      <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#40A0CA" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#006EA8" stopOpacity="0.6" />
                      </linearGradient>
                    </defs>
                    <rect x="50" y="100" width="40" height="160" fill="url(#skyGrad)" rx="2" />
                    <rect x="100" y="60" width="50" height="200" fill="url(#skyGrad)" rx="2" />
                    <rect x="160" y="120" width="35" height="140" fill="url(#skyGrad)" rx="2" />
                    <rect x="205" y="80" width="45" height="180" fill="url(#skyGrad)" rx="2" />
                    <rect x="260" y="40" width="55" height="220" fill="url(#skyGrad)" rx="2" />
                    <rect x="325" y="90" width="40" height="170" fill="url(#skyGrad)" rx="2" />
                    <rect x="375" y="50" width="60" height="210" fill="url(#skyGrad)" rx="2" />
                    <rect x="445" y="110" width="35" height="150" fill="url(#skyGrad)" rx="2" />
                    <rect x="490" y="70" width="50" height="190" fill="url(#skyGrad)" rx="2" />
                    <rect x="550" y="30" width="45" height="230" fill="url(#skyGrad)" rx="2" />
                    <rect x="605" y="100" width="40" height="160" fill="url(#skyGrad)" rx="2" />
                    <rect x="655" y="60" width="55" height="200" fill="url(#skyGrad)" rx="2" />
                    <rect x="720" y="90" width="35" height="170" fill="url(#skyGrad)" rx="2" />
                  </svg>
                </div>
              )}
              {/* Replace Cover button */}
              <label className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer">
                <span
                  className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(180deg, #006EA8 0%, #005685 100%)",
                    boxShadow: "0 4px 14px rgba(0,110,168,0.3), inset 0 1px 2px rgba(255,255,255,0.2)",
                  }}
                >
                  <Camera className="h-4 w-4" />
                  {isAr ? "تغيير الغلاف" : "Replace Cover"}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              </label>

              {/* Avatar */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <div className="relative h-[100px] w-[100px] rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Company logo" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd] flex items-center justify-center text-[#006EA8]">
                      <Globe className="h-10 w-10 stroke-[1.5]" />
                    </div>
                  )}
                  <label
                    className="absolute bottom-1 right-1 h-7 w-7 rounded-full flex items-center justify-center cursor-pointer shadow-md transition-transform hover:scale-110"
                    style={{
                      background: "linear-gradient(180deg, #006EA8 0%, #005685 100%)",
                    }}
                  >
                    <Camera className="h-3.5 w-3.5 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="h-16" /> {/* spacer for avatar */}

          {/* Form fields grid */}
          <div className="px-8 pb-8">
            <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
              {/* Company Name */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">
                  {isAr ? "اسم الشركة" : "Company Name"} <span className="text-red-500">*</span>
                </label>
                <input type="text" required className={fieldBase} {...register("name")} />
              </div>

              {/* CEO Name */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">
                  {isAr ? "اسم الرئيس التنفيذي" : "Company CEO name"} <span className="text-red-500">*</span>
                </label>
                <input type="text" required className={fieldBase} {...register("ceo_name")} />
              </div>

              {/* Email (disabled) */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">
                  {isAr ? "البريد الإلكتروني" : "Email"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  disabled
                  className="w-full border-b border-[#D4D4D4] py-2.5 text-sm text-[#A3A3A3] bg-transparent outline-none cursor-not-allowed"
                  {...register("email")}
                />
              </div>

              {/* Website */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">
                  {isAr ? "الموقع الإلكتروني" : "Website"} <span className="text-red-500">*</span>
                </label>
                <input type="url" required placeholder="https://example.com" className={fieldBase} {...register("website")} />
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">{isAr ? "كلمة المرور الجديدة" : "New password"}</label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    placeholder="••••••••••••"
                    className={fieldBase + " pe-10"}
                    {...register("new_password")}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowNewPw((p) => !p)}
                    className="absolute end-0 top-1/2 -translate-y-1/2 p-1.5 text-[#A3A3A3] hover:text-[#525252] transition-colors"
                  >
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">
                  {isAr ? "تأكيد كلمة المرور" : "Confirm password"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    placeholder="••••••••••••"
                    className={fieldBase + " pe-10"}
                    {...register("confirm_password")}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPw((p) => !p)}
                    className="absolute end-0 top-1/2 -translate-y-1/2 p-1.5 text-[#A3A3A3] hover:text-[#525252] transition-colors"
                  >
                    {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Country */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">
                  {isAr ? "البلد" : "Country"} <span className="text-red-500">*</span>
                </label>
                <div className="relative w-full">
                  <select required className={selectBase} {...register("country_id")}>
                    <option value="" disabled>{isAr ? "اختر البلد" : "Select Country"}</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute end-0 top-1/2 h-5 w-5 -translate-y-1/2 text-[#40A0CA]" />
                </div>
              </div>

              {/* City */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">
                  {isAr ? "المدينة" : "City"} <span className="text-red-500">*</span>
                </label>
                <div className="relative w-full">
                  <select required className={selectBase} {...register("city_id")} disabled={!selectedCountryId}>
                    <option value="" disabled>{isAr ? "اختر المدينة" : "Select City"}</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute end-0 top-1/2 h-5 w-5 -translate-y-1/2 text-[#40A0CA]" />
                </div>
              </div>

              {/* Phone with dial code */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">
                  {isAr ? "رقم الهاتف" : "Phone"} <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border-b border-[#D4D4D4] py-2 focus-within:border-[#40A0CA] transition-colors">
                  <div className="relative flex items-center shrink-0 pe-2 me-2 border-e border-[#D4D4D4]">
                    <select className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" {...register("dial_code")}>
                      {DIALING_CODES.map((d) => (
                        <option key={d.code} value={d.code}>{d.flag} {d.code}</option>
                      ))}
                    </select>
                    {isMounted && (
                      <>
                        <span className="text-base me-1">{activeDialObj.flag}</span>
                        <span className="text-sm text-[#525252] font-medium">{activeDialObj.code}</span>
                      </>
                    )}
                    <ChevronDown className="h-4 w-4 text-[#A3A3A3] ms-1 pointer-events-none" />
                  </div>
                  <input type="tel" required dir="ltr" className="w-full min-w-0 bg-transparent text-sm text-[#525252] outline-none" {...register("phone")} />
                </div>
              </div>

              {/* Postal Code */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">{isAr ? "الرمز البريدي" : "Postal Code"}</label>
                <input type="text" className={fieldBase} {...register("postal_code")} />
              </div>

              {/* Number of Employees */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">{isAr ? "عدد الموظفين" : "Number Of Employees"}</label>
                <input type="number" min={0} className={fieldBase} {...register("num_of_employees")} />
              </div>

              {/* Company Type */}
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-sm font-medium text-[#262626]">{isAr ? "نوع الشركة" : "Type Of Company"}</label>
                <div className="relative w-full">
                  <select className={selectBase} {...register("company_type_id")}>
                    <option value="">{isAr ? "اختر النوع" : "Select Type"}</option>
                    {companyTypes.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute end-0 top-1/2 h-5 w-5 -translate-y-1/2 text-[#40A0CA]" />
                </div>
              </div>

              {/* Description (full width) */}
              <div className="flex flex-col gap-1.5 md:col-span-2 text-start">
                <label className="text-sm font-medium text-[#262626]">
                  {isAr ? "وصف الشركة" : "Company Description"} <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full rounded-lg border border-[#E5E7EB] p-3 text-sm text-[#525252] bg-[#FAFAFA] outline-none transition-colors focus:border-[#40A0CA] focus:bg-white resize-y min-h-[100px] placeholder:text-[#A3A3A3]"
                  placeholder={isAr ? "أدخل وصف الشركة..." : "Enter company description..."}
                  {...register("description")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ==================== SOCIAL LINKS CARD ==================== */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden shadow-sm">
          <div className="px-8 pt-8 pb-4">
            <h2
              className="text-[22px] font-bold italic text-start"
              style={{
                background: "linear-gradient(270deg, #032C44 0%, #41A0CA 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {isAr ? "روابط التواصل الاجتماعي" : "Company Social Links"}
            </h2>
          </div>

          <div className="px-8 pb-8">
            {/* Buttons row */}
            <div className="flex flex-wrap items-center gap-3">
              <SocialLinkButton
                icon={<FontAwesomeIcon icon={faFacebook} className="h-4 w-4" />}
                label="Facebook"
                bgActive="#1877F2"
                isActive={!!watch("facebook")}
              />
              <SocialLinkButton
                icon={<FontAwesomeIcon icon={faLinkedin} className="h-4 w-4" />}
                label="LinkedIn"
                bgActive="#0A66C2"
                isActive={!!watch("linkedin")}
              />
              <SocialLinkButton
                icon={<FontAwesomeIcon icon={faTwitter} className="h-4 w-4" />}
                label="X"
                bgActive="#000000"
                isActive={!!watch("twitter_x")}
              />
              <SocialLinkButton
                icon={<FontAwesomeIcon icon={faPinterest} className="h-4 w-4" />}
                label="Pinterest"
                bgActive="#E60023"
                isActive={!!watch("pinterest")}
              />
            </div>

            {/* Input fields for social links */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-6">
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-xs font-medium text-[#6B7280] flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faFacebook} className="h-3.5 w-3.5 text-[#1877F2]" /> Facebook
                </label>
                <input type="url" placeholder="https://facebook.com/company" className={fieldBase} {...register("facebook")} />
              </div>
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-xs font-medium text-[#6B7280] flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faLinkedin} className="h-3.5 w-3.5 text-[#0A66C2]" /> LinkedIn
                </label>
                <input type="url" placeholder="https://linkedin.com/company/name" className={fieldBase} {...register("linkedin")} />
              </div>
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-xs font-medium text-[#6B7280] flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faTwitter} className="h-3.5 w-3.5 text-black" /> X (Twitter)
                </label>
                <input type="url" placeholder="https://x.com/company" className={fieldBase} {...register("twitter_x")} />
              </div>
              <div className="flex flex-col gap-1.5 text-start">
                <label className="text-xs font-medium text-[#6B7280] flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faPinterest} className="h-3.5 w-3.5 text-[#E60023]" /> Pinterest
                </label>
                <input type="url" placeholder="https://pinterest.com/company" className={fieldBase} {...register("pinterest")} />
              </div>
            </div>
          </div>
        </div>

        {/* ==================== NOTIFICATIONS & SUBMIT ==================== */}
        <div className="flex flex-col items-center gap-4">
          {message && (
            <div className="p-3 w-full rounded-lg bg-green-50 text-green-700 text-center text-sm font-medium border border-green-200">
              {message}
            </div>
          )}
          {errorMsg && (
            <div className="p-3 w-full rounded-lg bg-red-50 text-red-700 text-center text-sm font-medium border border-red-200">
              {errorMsg}
            </div>
          )}
          <PrimaryButton type="submit" disabled={loading || isSubmitting} className="max-w-[220px] h-[48px] text-base font-semibold">
            {loading || isSubmitting
              ? isAr
                ? "جاري الحفظ..."
                : "Saving..."
              : isAr
              ? "تحديث"
              : "Update"}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// Social Link Button Component
// ============================================================================
function SocialLinkButton({
  icon,
  label,
  bgActive,
  isActive,
}: {
  icon: React.ReactNode;
  label: string;
  bgActive: string;
  isActive: boolean;
}) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200"
      style={
        isActive
          ? {
              background: bgActive,
              color: "#FFFFFF",
              boxShadow: `0 2px 8px ${bgActive}40`,
            }
          : {
              background: "#F5F5F5",
              color: "#737373",
              border: "1px solid #E5E7EB",
            }
      }
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}