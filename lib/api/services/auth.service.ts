// lib/api/services/auth.service.ts
import { api } from "../client"
import type { ApiResponse, User, AuthTokens, Country, City, CompanyType } from "../types"

function normalizeCompanyName(value: unknown, locale = "ar") {
  if (typeof value !== "string" || value.trim() === "") {
    return value
  }

  return {
    [locale]: value,
    en: value,
    ar: value,
    de: value,
  }
}

function appendFormValue(formData: FormData, key: string, value: unknown) {
  if (value === undefined || value === null) {
    return
  }

  if (value instanceof File || value instanceof Blob) {
    formData.append(key, value)
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item) => appendFormValue(formData, `${key}[]`, item))
    return
  }

  if (typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([nestedKey, nestedValue]) => {
      appendFormValue(formData, `${key}[${nestedKey}]`, nestedValue)
    })
    return
  }

  formData.append(key, String(value))
}

export async function login(
  email: string,
  password: string,
  type: "user" | "company" = "user",
  locale = "ar"
): Promise<{ user: User; tokens: AuthTokens }> {
  if (typeof window !== "undefined") {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": locale,
      },
      body: JSON.stringify({ email, password, type }),
      cache: "no-store",
    })

    const data = (await response.json().catch(() => ({}))) as {
      user?: User
      tokens?: AuthTokens
      message?: string
      errors?: Record<string, string[]>
    }

    if (!response.ok) {
      throw new Error(data.message || "فشل تسجيل الدخول")
    }

    const user = data.user
    const tokens = data.tokens

    if (!user || !tokens?.access_token) {
      throw new Error("بيانات المستخدم غير موجودة في الرد")
    }

    return {
      user: {
        ...user,
        role: user.role || type,
      },
      tokens,
    }
  }

  const formData = new FormData()
  formData.append("email", email)
  formData.append("password", password)
  formData.append("type", type)

  const response = await api.post<ApiResponse<Record<string, unknown>>>(
    "/auth/login",
    formData,
    { locale }
  )

  const data = response.data
  const user = (data.user as User | undefined) || (data.id ? (data as unknown as User) : null)
  const tokens = (data.tokens as Record<string, unknown> | undefined) ?? {}

  if (!user) {
    throw new Error("بيانات المستخدم غير موجودة في الرد")
  }

  const access_token =
    (data.access_token as string | undefined) ||
    (data.token as string | undefined) ||
    (data.accessToken as string | undefined) ||
    (tokens.access_token as string | undefined) ||
    ""

  const refresh_token =
    (data.refresh_token as string | undefined) ||
    (data.refreshToken as string | undefined) ||
    (tokens.refresh_token as string | undefined) ||
    ""

  const token_type =
    (data.token_type as string | undefined) ||
    (data.tokenType as string | undefined) ||
    (tokens.token_type as string | undefined) ||
    "Bearer"

  const expires_in =
    (data.expires_in as number | undefined) ||
    (data.expiresIn as number | undefined) ||
    (tokens.expires_in as number | undefined) ||
    0

  return {
    user: {
      ...user,
      role: user.role || type,
    },
    tokens: {
      access_token,
      refresh_token,
      token_type: token_type as "Bearer",
      expires_in,
    },
  }
}

export type RegisterPayload = {
  name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
  type: "user" | "company"
  company_name?: string
  country_id?: number
  accept_terms_and_privacy?: boolean
}

export async function register(
  data: RegisterPayload,
  locale = "ar"
): Promise<{ user: User; tokens: AuthTokens }> {
  const formData = new FormData()
  formData.append("name", data.name)
  formData.append("email", data.email)
  formData.append("phone", data.phone)
  formData.append("password", data.password)
  formData.append("password_confirmation", data.password_confirmation)

  // Backend expects roles[] = "User" | "Company" (Postman)
  const roleLabel = data.type === "company" ? "Company" : "User"
  formData.append("roles[]", roleLabel)

  formData.append("country_id", String(data.country_id ?? 1))
  formData.append(
    "accept_terms_and_privacy",
    data.accept_terms_and_privacy === false ? "0" : "1"
  )

  if (data.company_name) {
    appendFormValue(formData, "company_name", normalizeCompanyName(data.company_name, locale))
  }

  const response = await api.post<ApiResponse<Record<string, unknown>>>(
    "/auth/register",
    formData,
    { locale }
  )

  const resData = response.data
  const user = (resData.user as User | undefined) || (resData.id ? (resData as unknown as User) : null)
  const tokens = (resData.tokens as Record<string, unknown> | undefined) ?? {}

  if (!user) {
    throw new Error("بيانات المستخدم غير موجودة في الرد")
  }

  const access_token =
    (resData.access_token as string | undefined) ||
    (resData.token as string | undefined) ||
    (resData.accessToken as string | undefined) ||
    (tokens.access_token as string | undefined) ||
    ""

  return {
    user: {
      ...user,
      role: user.role || data.type,
    },
    tokens: {
      access_token,
      refresh_token: (resData.refresh_token as string | undefined) || (tokens.refresh_token as string | undefined) || "",
      token_type: ((resData.token_type as string | undefined) || (tokens.token_type as string | undefined) || "Bearer") as "Bearer",
      expires_in: (resData.expires_in as number | undefined) || (tokens.expires_in as number | undefined) || 0,
    },
  }
}

export async function refreshToken(
  refreshToken: string,
  locale = "ar"
): Promise<AuthTokens> {
  const formData = new FormData()
  formData.append("refresh_token", refreshToken)

  const response = await api.post<ApiResponse<AuthTokens>>(
    "/auth/refresh-token",
    formData,
    { locale }
  )
  return response.data
}

export async function logout(token: string, locale = "ar"): Promise<void> {
  await api.post("/auth/logout", {}, { token, locale })
}

export async function forgotPassword(email: string, locale = "ar"): Promise<void> {
  const formData = new FormData()
  formData.append("email", email)
  await api.post("/auth/forgot-password", formData, { locale })
}

export async function verifyResetCode(
  email: string,
  code: string,
  locale = "ar"
): Promise<{ token: string }> {
  const formData = new FormData()
  formData.append("email", email)
  formData.append("code", code)
  const response = await api.post<ApiResponse<{ token: string }>>(
    "/auth/verify-reset-code",
    formData,
    { locale }
  )
  return response.data
}

export async function resetPassword(
  data: { token: string; password: string; password_confirmation: string },
  locale = "ar"
): Promise<void> {
  const formData = new FormData()
  Object.entries(data).forEach(([k, v]) => formData.append(k, v))
  await api.post("/auth/reset-password", formData, { locale })
}

export async function getProfile(token: string, locale = "ar"): Promise<User> {
  const response = await api.get<ApiResponse<User>>("/auth/profile", { token, locale })
  return response.data
}

export async function resendVerification(email: string, locale = "ar"): Promise<void> {
  const formData = new FormData()
  formData.append("email", email)
  await api.post("/auth/resend-verification", formData, { locale })
}

export async function verifyEmail(email: string, code: string, locale = "ar"): Promise<void> {
  const formData = new FormData()
  formData.append("email", email)
  formData.append("code", code)
  await api.post("/auth/verify", formData, { locale })
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

function parseList<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[]
  if (response && typeof response === "object") {
    const root = response as Record<string, unknown>
    if (Array.isArray(root.data)) return root.data as T[]
  }
  return []
}

export async function getCountries(locale = "ar", token?: string): Promise<Country[]> {
  const response = await api.get<unknown>("/countries", { locale, token })
  return parseList<Country>(response)
}

export async function getCities(countryId: number, locale = "ar", token?: string): Promise<City[]> {
  const response = await api.get<unknown>(`/cities/${countryId}`, { locale, token })
  return parseList<City>(response)
}

export async function getCompanyTypes(locale = "ar", token?: string): Promise<CompanyType[]> {
  const response = await api.get<unknown>("/company-types", { locale, token })
  return parseList<CompanyType>(response)
}
