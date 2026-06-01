"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { updateProfile, uploadAvatar, getProfile } from "@/lib/api/services/auth.service"
import { COUNTRIES, getCountryById } from "@/lib/countries"

type Props = {
  locale: string
  initialProfile?: Record<string, any>
}

type Category = { id: number; name: string; sub_categories?: { id: number; name: string }[] }
type Country = { id: number; name: string; code?: string; flag?: string; dialCode?: string }

export default function UserProfileClient({ locale, initialProfile }: Props) {
  const { loading } = useAuth()

  const [profile, setProfile] = useState<Record<string, any>>(initialProfile ?? {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    country: "",
    category: "",
    sub_category: "",
    avatar: "",
    locale: "",
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialProfile?.avatar ?? null)
  const [message, setMessage] = useState("")
  const [fetching, setFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<{ id: number; name: string }[]>([])
  const [countries, setCountries] = useState<Country[]>([])

  useEffect(() => {
    let mounted = true
    async function loadProfile() {
      if (initialProfile) return
      setFetching(true)
      try {
        const res = await fetch("/api/auth/profile", { headers: { "x-locale": locale } })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.message || "فشل جلب البيانات")
        if (!mounted) return
        const p: any = data.data || {}
        const userProfile = p.Userprofile || {}
        
        // Extract name - use firstName/lastName from Userprofile if available, else split full name
        let firstName = userProfile.firstName || ""
        let lastName = userProfile.lastName || ""
        if (!firstName && !lastName && p.name) {
          const parts = (p.name || "").split(" ")
          firstName = parts.shift() || ""
          lastName = parts.join(" ") || ""
        }

        // Extract category/subcategory from nested Userprofile (camelCase: categoryId, subcategoryId)
        const categoryId = userProfile.categoryId || p.category?.id || undefined
        const subcategoryId = userProfile.subcategoryId || p.sub_category?.id || undefined

        setProfile({
          first_name: firstName,
          last_name: lastName,
          email: p.email || "",
          phone: p.phone || "",
          gender: userProfile.gender || p.gender || "",
          dob: userProfile.dateOfBirth || p.dob || "",
          country: p.country?.name || "",
          country_id: p.country?.id ?? p.country_id,
          country_code: p.country?.code || "", // dial code like "+20"
          category: p.category?.name || "",
          category_id: categoryId,
          sub_category: p.sub_category?.name || "",
          sub_category_id: subcategoryId,
          avatar: p.avatar || "",
          facebook: userProfile.facebook || p.facebook || "",
          linkedin: userProfile.linkedin || p.linkedin || "",
          twitter: userProfile.twitterX || p.twitterX || "",
          pinterest: userProfile.pinterest || p.pinterest || "",
          phone_code: p.country?.code || "+20", // use country dial code
          locale: p.locale || p.preferences?.locale || "",
        })
        setAvatarPreview(p.avatar || null)
      } catch (err) {
        // ignore
      } finally {
        if (mounted) setFetching(false)
      }
    }
    loadProfile()
    return () => {
      mounted = false
    }
  }, [initialProfile, locale])

  // Load categories + countries for selects
  useEffect(() => {
    let mounted = true
    async function loadMeta() {
      try {
        const [cRes, cntRes] = await Promise.all([
          fetch(`/api/categories?locale=${locale}`).then((r) => r.json()).catch(() => ({ data: [] })),
          fetch(`/api/countries?locale=${locale}`).then((r) => r.json()).catch(() => ({ data: [] })),
        ])
        if (!mounted) return
        setCategories(Array.isArray(cRes?.data) ? cRes.data : [])
        setCountries(Array.isArray(cntRes?.data) ? cntRes.data : [])

        // if initialProfile has category_id prefilled, populate subcategories
        const cid = profile.category_id || profile.category_id === 0 ? profile.category_id : undefined
        if (cid) {
          const cat = (Array.isArray(cRes?.data) ? cRes.data : []).find((x: any) => Number(x.id) === Number(cid))
          if (cat && Array.isArray(cat.sub_categories)) setSubCategories(cat.sub_categories)
        }
      } catch (err) {
        // ignore
      }
    }
    loadMeta()
    return () => {
      mounted = false
    }
  }, [locale, profile.category_id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    // handle selects that should store ids
    if (name === "category") {
      const id = Number(value) || undefined
      const selected = categories.find((c) => c.id === id)
      setSubCategories(selected?.sub_categories || [])
      setProfile((s) => ({ ...s, category_id: id, category: selected?.name || "", sub_category_id: undefined, sub_category: "" }))
      return
    }

    if (name === "sub_category") {
      const id = Number(value) || undefined
      const selected = subCategories.find((s) => s.id === id)
      setProfile((s) => ({ ...s, sub_category_id: id, sub_category: selected?.name || "" }))
      return
    }

    if (name === "country") {
      const id = Number(value) || undefined
      const selected = countries.find((c) => Number(c.id) === Number(id))
      // When country changes, auto-sync the phone code with the country's dial code
      const dialCode = (selected as any)?.dialCode || selected?.code || "+20"
      const rawPhone = (profile.phone || "").replace(/^\+\d+/, "").trim()
      const newPhone = rawPhone ? `${dialCode}${rawPhone}` : dialCode
      setProfile((s) => ({ 
        ...s, 
        country_id: id, 
        country: selected?.name || "",
        phone_code: dialCode,
        phone: newPhone
      }))
      return
    }

    setProfile((s) => ({ ...s, [name]: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    try {
      const form = new FormData()
      form.append("name", `${profile.first_name} ${profile.last_name}`)
      form.append("email", profile.email || "")
      form.append("phone", profile.phone || "")
      
      // Build Userprofile nested object
      if (profile.gender) form.append("Userprofile[gender]", profile.gender)
      if (profile.dob) form.append("Userprofile[dateOfBirth]", profile.dob)
      if (profile.facebook) form.append("Userprofile[facebook]", profile.facebook)
      if (profile.linkedin) form.append("Userprofile[linkedin]", profile.linkedin)
      if (profile.twitter) form.append("Userprofile[twitterX]", profile.twitter)
      if (profile.pinterest) form.append("Userprofile[pinterest]", profile.pinterest)
      if (profile.category_id) form.append("Userprofile[categoryId]", String(profile.category_id))
      if (profile.sub_category_id) form.append("Userprofile[subcategoryId]", String(profile.sub_category_id))
      
      // Country and locale
      if (profile.country_id) form.append("country_id", String(profile.country_id))
      if (profile.locale) form.append("locale", profile.locale)
      if (avatarFile) form.append("avatar", avatarFile)

      const res = await fetch("/api/auth/profile", {
        method: "POST",
        body: form,
        headers: { "x-locale": locale },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "فشل حفظ البيانات")
      setMessage(locale === "ar" ? "تم حفظ البيانات بنجاح" : "Saved successfully")
      if (data.data?.avatar) setAvatarPreview(data.data.avatar)
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : (locale === "ar" ? "فشل حفظ البيانات" : "Failed to save"))
    } finally {
      setSaving(false)
    }
  }

  const isAr = locale === "ar"

  return (
    <div className="w-full">
      <div className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 sm:p-6 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-6">{isAr ? "المعلومات الأساسية" : "Basic Info"}</h1>

        {message && (
          <div className="mb-4 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm sm:text-base">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Avatar Section - Left Sidebar */}
          <div className="lg:col-span-1 flex flex-col items-center gap-6">
            {/* Avatar */}
            <div className="relative w-full flex flex-col items-center">
              <Avatar size="lg" className="h-32 w-32 sm:h-40 sm:w-40">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt="avatar" />
                ) : (
                  <AvatarFallback className="text-4xl">
                    {(profile.first_name || profile.email || "").charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <label className="mt-3">
                <input
                  accept="image/*"
                  onChange={handleAvatarChange}
                  type="file"
                  className="hidden"
                />
                <span className="inline-flex items-center justify-center px-4 py-2 bg-white text-xs sm:text-sm rounded-full border border-gray-200 cursor-pointer hover:bg-gray-50 transition">
                  {isAr ? "رفع الصورة" : "Upload Photo"}
                </span>
              </label>
            </div>

            {/* Linked Accounts */}
            <div className="w-full">
              <h4 className="text-sm font-semibold text-[#111827] mb-3">
                {isAr ? "الحسابات المرتبطة" : "Linked accounts"}
              </h4>
              <div className="flex flex-col gap-2 w-full">
                <button className="w-full py-2 rounded text-xs sm:text-sm bg-[#1877F2] text-white hover:bg-[#1563D3] transition font-medium">
                  Facebook
                </button>
                <button className="w-full py-2 rounded text-xs sm:text-sm border border-gray-300 hover:bg-gray-50 transition text-gray-700 font-medium">
                  LinkedIn
                </button>
                <button className="w-full py-2 rounded text-xs sm:text-sm border border-gray-300 hover:bg-gray-50 transition text-gray-700 font-medium">
                  X
                </button>
                <button className="w-full py-2 rounded text-xs sm:text-sm border border-gray-300 hover:bg-gray-50 transition text-gray-700 font-medium">
                  Pinterest
                </button>
              </div>
            </div>
          </div>

          {/* Form Section - Main Content */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">
                  {isAr ? "الاسم الأول" : "First Name"}
                </label>
                <Input
                  name="first_name"
                  value={profile.first_name}
                  onChange={handleChange}
                  placeholder={isAr ? "الاسم الأول" : "Taha"}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">
                  {isAr ? "اسم العائلة" : "Last Name"}
                </label>
                <Input
                  name="last_name"
                  value={profile.last_name}
                  onChange={handleChange}
                  placeholder={isAr ? "اسم العائلة" : "Mohamed"}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">
                  {isAr ? "البريد الإلكتروني" : "Email"}
                </label>
                <Input
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="taha@gmail.com"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">
                  {isAr ? "الجنس" : "Gender"}
                </label>
                <select
                  aria-label="gender"
                  name="gender"
                  value={profile.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">{isAr ? "اختر" : "Select"}</option>
                  <option value="male">{isAr ? "ذكر" : "Male"}</option>
                  <option value="female">{isAr ? "أنثى" : "Female"}</option>
                  <option value="other">{isAr ? "أخرى" : "Other"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">
                  {isAr ? "تاريخ الميلاد" : "Date of Birth"}
                </label>
                <Input
                  type="date"
                  name="dob"
                  value={profile.dob}
                  onChange={handleChange}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">
                  {isAr ? "الهاتف" : "Phone"}
                </label>
                <div className="flex gap-2">
                    <select
                      aria-label="phone-code"
                      name="phone_code"
                      value={String(profile.phone_code || profile.phone?.match(/^\+\d+/)?.[0] || "+20")}
                      onChange={(e) => {
                        const code = e.target.value
                        const raw = (profile.phone || "").replace(/^\+\d+/, "").trim()
                        setProfile((s) => ({ ...s, phone: `${code}${raw}`, phone_code: code }))
                      }}
                      className="px-3 py-2 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-blue-500 w-auto"
                    >
                      <option value="">{isAr ? "رمز" : "Code"}</option>
                      {COUNTRIES.map((c) => (
                        <option key={c.id} value={c.dialCode}>
                          {c.flag} {c.dialCode}
                        </option>
                      ))}
                    </select>
                    <Input
                      name="phone"
                      value={(profile.phone || "").replace(/^\+\d+/, "")}
                      onChange={(e) => {
                        const raw = e.target.value
                        const code = profile.phone_code || profile.phone?.match(/^\+\d+/)?.[0] || "+20"
                        setProfile((s) => ({ ...s, phone: `${code}${raw}` }))
                      }}
                      placeholder={isAr ? "رقم الهاتف" : "1003630088"}
                      className="text-sm flex-1"
                    />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">
                  {isAr ? "البلد" : "Country"}
                </label>
                <select
                  aria-label={isAr ? "البلد" : "Country"}
                  name="country"
                  value={profile.country_id || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">{isAr ? "اختر البلد" : "Select Country"}</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {(c as any).flag || "🌍"} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">
                  {isAr ? "التخصص" : "Category"}
                </label>
                <select
                  aria-label={isAr ? "التخصص" : "Category"}
                  name="category"
                  value={profile.category_id || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">{isAr ? "اختر التخصص" : "Select Category"}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">
                  {isAr ? "التخصص الفرعي" : "Sub Category"}
                </label>
                <select
                  aria-label={isAr ? "التخصص الفرعي" : "Sub Category"}
                  name="sub_category"
                  value={profile.sub_category_id || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">{isAr ? "اختر" : "Select Sub Category"}</option>
                  {subCategories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">
                {isAr ? "اللغة المفضلة" : "Preferred Language"}
              </label>
              <select
                aria-label={isAr ? "اللغة المفضلة" : "Preferred Language"}
                name="locale"
                value={profile.locale || locale}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="ar">العربية (Arabic)</option>
                <option value="en">English</option>
                <option value="de">Deutsch (German)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">
                {isAr ? "كلمة المرور الجديدة" : "New password"}
              </label>
              <Input
                type="password"
                placeholder={isAr ? "••••••••••" : "••••••••••"}
                className="text-sm"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">
                {isAr ? "تأكيد كلمة المرور" : "Confirm password"}
              </label>
              <Input
                type="password"
                placeholder={isAr ? "••••••••••" : "••••••••••"}
                className="text-sm"
              />
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={saving || loading}
                className="px-12 py-3 rounded-full bg-gradient-to-r from-[#006EA8] to-[#005685] text-white text-base font-semibold shadow-[0_24px_48px_rgba(0,86,133,0.16)] hover:shadow-[0_24px_48px_rgba(0,86,133,0.24)] transition disabled:opacity-60"
              >
                {saving ? (isAr ? "جاري التحديث..." : "Updating...") : (isAr ? "تحديث" : "Update")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
