# Profile Page Implementation Analysis

## 1. Server Component: `app/[locale]/dashboard/user/profile/page.tsx`

```typescript
// server wrapper to provide locale + session to the client component
import { redirect } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import { getSession } from "@/lib/session"
import UserProfileClient from "./client"
import { getProfile } from "@/lib/api/services/auth.service"

export default async function UserProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await getSession()

  if (!session.isLoggedIn || !session.accessToken) {
    redirect(`/${locale}/sign-in`)
  }

  // prefetch profile server-side so client has initial data and locale
  let initialProfile: Record<string, any> | undefined = undefined
  try {
    const user = await getProfile(session.accessToken!, locale)
    if (user) {
      const parts = (user.name || "").split(" ")
      initialProfile = {
        first_name: parts.shift() || "",
        last_name: parts.join(" ") || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "",
        dob: user.dob || "",
        // provide both localized name and ids so client can pick IDs
        country: user.country?.name || "",
        country_id: user.country?.id ?? user.country_id,
        category: user.category?.name || "",
        category_id: user.category?.id ?? user.category_id,
        sub_category: user.sub_category?.name || "",
        sub_category_id: user.sub_category?.id ?? user.sub_category_id,
        avatar: user.avatar || "",
      }
    }
  } catch (err) {
    // ignore - client will fetch
  }

  return <UserProfileClient locale={locale} initialProfile={initialProfile} />
}
```

**Key Features:**
- Authentication check with redirect to sign-in if not authenticated
- Server-side prefetch of profile data to provide initial data to client
- Locale management via Next-Intl
- Splits full name into first and last names
- Provides both IDs and names for dropdowns

---

## 2. Client Component: `app/[locale]/dashboard/user/profile/client.tsx`

```typescript
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { updateProfile, uploadAvatar, getProfile } from "@/lib/api/services/auth.service"

type Props = {
  locale: string
  initialProfile?: Record<string, any>
}

type Category = { id: number; name: string; sub_categories?: { id: number; name: string }[] }
type Country = { id: number; name: string; code?: string }

export default function UserProfileClient({ locale, initialProfile }: Props) {
  const { loading } = useAuth()

  // STATE MANAGEMENT
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
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialProfile?.avatar ?? null)
  const [message, setMessage] = useState("")
  const [fetching, setFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<{ id: number; name: string }[]>([])
  const [countries, setCountries] = useState<Country[]>([])

  // EFFECT 1: Load profile if not prefetched
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
        const parts = (p.name || "").split(" ")
        setProfile({
          first_name: parts.shift() || "",
          last_name: parts.join(" ") || "",
          email: p.email || "",
          phone: p.phone || "",
          gender: p.gender || "",
          dob: p.dob || "",
          country: p.country?.name || "",
          country_id: p.country?.id ?? p.country_id,
          category: p.category?.name || "",
          category_id: p.category?.id ?? p.category_id,
          sub_category: p.sub_category?.name || "",
          sub_category_id: p.sub_category?.id ?? p.sub_category_id,
          avatar: p.avatar || "",
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

  // EFFECT 2: Load categories + countries for selects
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
      mounted = true
    }
  }, [locale, profile.category_id])

  // HANDLERS
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
      setProfile((s) => ({ ...s, country_id: id, country: selected?.name || "" }))
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
      if (profile.gender) form.append("gender", profile.gender)
      if (profile.dob) form.append("dob", profile.dob)
      // append both ids and names where available to be robust
      if (profile.country_id) form.append("country_id", String(profile.country_id))
      if (profile.country) form.append("country", String(profile.country))
      if (profile.category_id) form.append("category_id", String(profile.category_id))
      if (profile.category) form.append("category", String(profile.category))
      if (profile.sub_category_id) form.append("sub_category_id", String(profile.sub_category_id))
      if (profile.sub_category) form.append("sub_category", String(profile.sub_category))
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
```

**State Management:**
- `profile`: Main profile object with all fields
- `avatarFile`: Stores selected avatar file for upload
- `avatarPreview`: Preview URL for selected image
- `message`: Feedback message (success/error)
- `fetching`: Loading state for initial data
- `saving`: Loading state for form submission
- `categories`: List of job categories with subcategories
- `subCategories`: Filtered subcategories based on selected category
- `countries`: List of countries

**Data Mapping Strategy:**
- Stores both IDs and display names (e.g., `category_id` and `category`)
- When user selects from dropdown, both are updated
- FormData submission sends both for robustness
- Joins first_name + last_name into single "name" field for API

---

## 3. Auth Service Functions: `lib/api/services/auth.service.ts`

```typescript
export async function getProfile(token: string, locale = "ar"): Promise<User> {
  const response = await api.get<ApiResponse<User>>("/auth/profile", { token, locale })
  return response.data
}

export async function updateProfile(
  data: Record<string, unknown>,
  token: string,
  locale = "ar"
): Promise<User> {
  const formData = new FormData()
  const normalizedData = {
    ...data,
    company_name: normalizeCompanyName(data.company_name, locale),
  }

  Object.entries(normalizedData).forEach(([k, v]) => {
    appendFormValue(formData, k, v)
  })

  const response = await api.post<ApiResponse<User>>("/auth/profile", formData, { token, locale })
  return response.data
}

export async function uploadAvatar(file: File | Blob, token: string, locale = "ar"): Promise<User> {
  const formData = new FormData()
  formData.append("avatar", file)
  const response = await api.post<ApiResponse<User>>("/auth/profile/avatar", formData, { token, locale })
  return response.data
}

export async function deleteAvatar(token: string, locale = "ar"): Promise<void> {
  await api.delete("/auth/profile/avatar", { token, locale })
}

export async function updatePassword(
  current_password: string,
  new_password: string,
  new_password_confirmation: string,
  token: string,
  locale = "ar"
): Promise<void> {
  const formData = new FormData()
  formData.append("current_password", current_password)
  formData.append("new_password", new_password)
  formData.append("new_password_confirmation", new_password_confirmation)
  await api.post("/auth/profile/password", formData, { token, locale })
}

export async function getPreferences(token: string, locale = "ar"): Promise<unknown> {
  const response = await api.get<ApiResponse<unknown>>("/auth/profile/preferences", { token, locale })
  return response.data
}

export async function updatePreferences(
  data: Record<string, unknown>,
  token: string,
  locale = "ar"
): Promise<void> {
  const formData = new FormData()
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null) formData.append(k, String(v))
  })
  await api.post("/auth/profile/preferences", formData, { token, locale })
}
```

---

## 4. Countries Data Structure: `lib/countries.ts`

```typescript
export interface CountryData {
  id: number
  name: string
  code: string
  flag: string
  dialCode: string
}

export const COUNTRIES: CountryData[] = [
  // Middle East & North Africa
  { id: 1, name: "مصر", code: "EG", flag: "🇪🇬", dialCode: "+20" },
  { id: 2, name: "المملكة العربية السعودية", code: "SA", flag: "🇸🇦", dialCode: "+966" },
  { id: 3, name: "الإمارات العربية المتحدة", code: "AE", flag: "🇦🇪", dialCode: "+971" },
  { id: 4, name: "المغرب", code: "MA", flag: "🇲🇦", dialCode: "+212" },
  { id: 5, name: "الجزائر", code: "DZ", flag: "🇩🇿", dialCode: "+213" },
  { id: 6, name: "تونس", code: "TN", flag: "🇹🇳", dialCode: "+216" },
  { id: 7, name: "الأردن", code: "JO", flag: "🇯🇴", dialCode: "+962" },
  { id: 8, name: "لبنان", code: "LB", flag: "🇱🇧", dialCode: "+961" },
  { id: 9, name: "فلسطين", code: "PS", flag: "🇵🇸", dialCode: "+970" },
  { id: 10, name: "سوريا", code: "SY", flag: "🇸🇾", dialCode: "+963" },
  { id: 11, name: "العراق", code: "IQ", flag: "🇮🇶", dialCode: "+964" },
  { id: 12, name: "اليمن", code: "YE", flag: "🇾🇪", dialCode: "+967" },
  { id: 13, name: "عمان", code: "OM", flag: "🇴🇲", dialCode: "+968" },
  { id: 14, name: "الكويت", code: "KW", flag: "🇰🇼", dialCode: "+965" },
  { id: 15, name: "قطر", code: "QA", flag: "🇶🇦", dialCode: "+974" },
  { id: 16, name: "البحرين", code: "BH", flag: "🇧🇭", dialCode: "+973" },

  // Europe
  { id: 17, name: "ألمانيا", code: "DE", flag: "🇩🇪", dialCode: "+49" },
  { id: 18, name: "فرنسا", code: "FR", flag: "🇫🇷", dialCode: "+33" },
  { id: 19, name: "إيطاليا", code: "IT", flag: "🇮🇹", dialCode: "+39" },
  { id: 20, name: "إسبانيا", code: "ES", flag: "🇪🇸", dialCode: "+34" },
  // ... more countries

  // Americas
  { id: 36, name: "الولايات المتحدة", code: "US", flag: "🇺🇸", dialCode: "+1" },
  { id: 37, name: "كندا", code: "CA", flag: "🇨🇦", dialCode: "+1" },
  // ... more countries
]

// Helper functions:
export function getCountryByCode(code: string): CountryData | undefined
export function getCountryById(id: number): CountryData | undefined
export function getCountriesByRegion(region: "mena" | "europe" | "americas" | "asia"): CountryData[]
export function countryToFlag(code: string): string
export function countryToName(code: string): string
```

**Total Countries:** 47 countries covering MENA (16), Europe (19), Americas (4), and Asia & Pacific (8)

---

## 5. Admin Pages

Admin dashboard exists at `app/[locale]/dashboard/admin/` with following sections:

- **users/** → `page.tsx` (User management)
- **companies/** → `page.tsx` (Company management)
- **categories/** → Categories management
- **jobs/** → Jobs management
- **news/** → News management
- **notifications/** → Notifications management
- **contact/** → Contact management
- **home/** → Home page management
- **success-stories/** → Success stories management
- **about/** → About page management
- **settings/** → Admin settings
- **services/** → Services management

---

## 6. Type Definitions: `lib/api/types.ts`

```typescript
export interface User {
  id: number
  name: string
  email: string
  phone?: string
  avatar?: string
  role: "user" | "company" | "admin"
  email_verified_at?: string
  preferences?: UserPreferences
  // Additional fields available from backend:
  gender?: string
  dob?: string
  country?: Country
  country_id?: number
  category?: Category
  category_id?: number
  sub_category?: SubCategory
  sub_category_id?: number
}

export interface Country {
  id: number
  name: string
  code: string
  flag?: string
}

export interface Category {
  id: number
  name: string
  slug: string
  icon?: string
  jobs_count?: number
  sub_categories?: SubCategory[]
}

export interface SubCategory {
  id: number
  name: string
  slug?: string
}

export interface UserPreferences {
  language: "ar" | "en" | "de"
  notifications: boolean
}

export interface ApiResponse<T> {
  data: T
  message?: string
  meta?: PaginationMeta
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}
```

---

## Summary

### Data Flow:
1. **Server Component** → Fetches profile via `getProfile()` with auth token
2. **Splits Name** → Converts "first last" to separate fields
3. **Client Component** → Receives prefetched data + loads categories/countries
4. **State Updates** → Maintains profile object with both IDs and names
5. **Form Submission** → Posts to `/api/auth/profile` with FormData
6. **Avatar Handling** → Optional file upload alongside profile update

### Key Patterns:
- **Server-side prefetch** for performance and initial data
- **Dual storage** of IDs and names for form robustness
- **Lazy loading** of metadata (categories, countries) on client
- **Mounted flag** to prevent state updates after unmount
- **Multilingual support** with locale passed to all API calls
- **Error handling** with fallbacks to client-side fetch if server fails

### Admin Sections:
✅ Admin pages exist in all major areas (users, companies, content management)
