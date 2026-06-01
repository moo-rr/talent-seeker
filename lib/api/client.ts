// lib/api/client.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.talentseeker.com/api/v1"
const isBrowser = typeof window !== "undefined"

export class ApiError extends Error {
  public status: number
  public errors?: Record<string, string[]>
  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.errors = errors
  }
}

type FetchOptions = RequestInit & { locale?: string; token?: string; timeout?: number }

function ensureBrowserSafeRequest(endpoint: string) {
  if (!isBrowser) {
    return
  }

  if (!endpoint.startsWith("/")) {
    throw new Error("Browser-side API calls must use a local path such as /api/...")
  }

  if (!BASE_URL.startsWith(window.location.origin)) {
    throw new Error(
      "Browser-side API calls are blocked for external API origins. Use a local Next.js route instead."
    )
  }
}

function appendLocaleQuery(endpoint: string, locale?: string) {
  if (!locale) {
    return endpoint
  }

  try {
    const url = new URL(endpoint, "http://localhost")
    if (!url.searchParams.has("locale")) {
      url.searchParams.set("locale", locale)
    }

    if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
      return url.toString()
    }

    return `${url.pathname}${url.search}`
  } catch {
    return endpoint
  }
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  ensureBrowserSafeRequest(endpoint)
  const { locale: optLocale, token, ...fetchOptions } = options

  // Determine locale automatically when not provided:
  // - On the server read the `X-NEXT-INTL-LOCALE` / `x-requested-locale` / `accept-language` header
  // - In the browser infer from the pathname (e.g. /ar/..., /en/...)
  let locale = optLocale
  if (!locale) {
    if (!isBrowser) {
      try {
        const mod = await import("next/headers")
        const h = await mod.headers()
        const headerLocale = h.get("X-NEXT-INTL-LOCALE") || h.get("x-requested-locale") || h.get("accept-language")
        if (headerLocale) {
          locale = headerLocale.split(",")[0]
        }
      } catch {
        // ignore - fallback handled below
      }
    } else {
      try {
        const m = window.location.pathname.match(/^\/([a-z]{2})(?:\/|$)/)
        locale = m && m[1] ? m[1] : "ar"
      } catch {
        locale = "ar"
      }
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Accept-Language": locale || "ar",
    // Some backends expect a custom locale header — include it for robustness
    "X-Requested-Locale": locale || "ar",
    ...((fetchOptions.headers as Record<string, string>) || {}),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  // For FormData do not set Content-Type (browser/node fetch will set it)
  if (!(fetchOptions.body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }

  const endpointWithLocale =
    fetchOptions.method === "GET" ? appendLocaleQuery(endpoint, locale) : endpoint
  const requestUrl =
    endpointWithLocale.startsWith("http://") || endpointWithLocale.startsWith("https://")
      ? endpointWithLocale
      : `${BASE_URL}${endpointWithLocale}`
  
  const nextOption = (fetchOptions as any).next
  const cacheOption =
    (fetchOptions as unknown as { cache?: RequestCache }).cache ??
    (nextOption ? undefined : "no-store")

  // Debug logging removed to reduce console noise
  // Add an AbortController-based timeout to avoid hanging requests
  const controller = new AbortController()
  const timeoutMs = (fetchOptions as any).timeout ?? 8000
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  const start = Date.now()

  let res: Response
  try {
    res = await fetch(requestUrl, {
      ...fetchOptions,
      headers,
      cache: cacheOption,
      signal: controller.signal,
    })
  } catch (err: any) {
    clearTimeout(timeoutId)
    const duration = Date.now() - start
    if (!isBrowser && duration > 2000) {
      console.warn(`[fetchApi] slow failure ${requestUrl} ${duration}ms`)
    }
    if (err && err.name === "AbortError") {
      throw new ApiError(0, `Request timed out after ${timeoutMs}ms`)
    }
    // Network or other unexpected error
    throw new ApiError(0, err?.message || "Network error")
  }
  clearTimeout(timeoutId)

  const duration = Date.now() - start
  if (!isBrowser && duration > 2000) {
    console.warn(`[fetchApi] slow request ${requestUrl} ${duration}ms`)
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const message = errorData.message || `Request failed with status ${res.status}`
    const errors = errorData.errors as Record<string, string[]> | undefined
    throw new ApiError(res.status, message, errors)
  }

  // Some endpoints return an empty body
  const text = await res.text()
  if (!text) return (null as unknown) as T
  try {
    return JSON.parse(text) as T
  } catch {
    // Silently return raw text if JSON parsing fails
    return (text as unknown) as T
  }
}

export const api = {
  get: <T>(
    endpoint: string,
    opts?: {
      locale?: string
      token?: string
      cache?: RequestCache
      next?: { revalidate?: number; tags?: string[] }
    }
  ) => fetchApi<T>(endpoint, { method: "GET", ...opts }),

  post: <T>(endpoint: string, body?: FormData | Record<string, unknown>, opts?: { locale?: string; token?: string }) =>
    fetchApi<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      ...opts,
    }),

  put: <T>(endpoint: string, body: Record<string, unknown>, opts?: { locale?: string; token?: string }) =>
    fetchApi<T>(endpoint, { method: "PUT", body: JSON.stringify(body), ...opts }),

  patch: <T>(endpoint: string, body?: Record<string, unknown>, opts?: { locale?: string; token?: string }) =>
    fetchApi<T>(endpoint, { method: "PATCH", body: body ? JSON.stringify(body) : undefined, ...opts }),

  delete: <T>(endpoint: string, opts?: { locale?: string; token?: string }) =>
    fetchApi<T>(endpoint, { method: "DELETE", ...opts }),
}
