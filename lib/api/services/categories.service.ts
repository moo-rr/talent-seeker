// lib/api/services/categories.service.ts
import { api } from "../client"
import { getHomeData } from "./home.service"
import type { ApiResponse, Category, SubCategory } from "../types"

function pickName(item: Record<string, unknown>, locale: string): string {
  if (typeof item.name === "string") return item.name
  const names = item.name as Record<string, string> | undefined
  if (names && typeof names === "object") {
    return names[locale] || names.en || names.ar || names.de || ""
  }
  const title = item.title
  if (typeof title === "string") return title
  if (title && typeof title === "object") {
    const map = title as Record<string, string>
    return map[locale] || map.en || map.ar || map.de || ""
  }
  return String(item.label || "")
}

function extractList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  if (!raw || typeof raw !== "object") return []

  const obj = raw as Record<string, unknown>

  if (Array.isArray(obj.categories)) return obj.categories
  if (Array.isArray(obj.data)) return obj.data
  if (Array.isArray(obj.items)) return obj.items

  const data = obj.data
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const nested = data as Record<string, unknown>
    if (Array.isArray(nested.categories)) return nested.categories
    if (Array.isArray(nested.data)) return nested.data
    if (Array.isArray(nested.items)) return nested.items
  }

  return []
}

function parseSubCategory(raw: Record<string, unknown>, locale: string): SubCategory | null {
  const id = Number(raw.id)
  if (!Number.isFinite(id) || id <= 0) return null

  const name = pickName(raw, locale)
  if (!name) return null

  return {
    id,
    name,
    slug: typeof raw.slug === "string" ? raw.slug : undefined,
  }
}

function parseCategory(raw: Record<string, unknown>, locale: string): Category | null {
  const id = Number(raw.id)
  if (!Number.isFinite(id) || id <= 0) return null

  const name = pickName(raw, locale)
  if (!name) return null

  const subs =
    raw.sub_categories ??
    raw.subCategories ??
    raw.subcategories ??
    raw.sub_categories_list ??
    raw.children ??
    raw.subs

  let sub_categories: SubCategory[] | undefined

  if (Array.isArray(subs)) {
    sub_categories = subs
      .map((s) => parseSubCategory(s as Record<string, unknown>, locale))
      .filter((s): s is SubCategory => s !== null)
  }

  return {
    id,
    name,
    slug: String(raw.slug || ""),
    icon: typeof raw.icon === "string" ? raw.icon : undefined,
    jobs_count:
      raw.jobs_count != null
        ? Number(raw.jobs_count)
        : raw.jobsCount != null
          ? Number(raw.jobsCount)
          : raw.vacancyCount != null
            ? Number(raw.vacancyCount)
            : raw.vacancy_count != null
              ? Number(raw.vacancy_count)
              : undefined,
    sub_categories: sub_categories?.length ? sub_categories : undefined,
  }
}

function parseCategoriesResponse(response: unknown, locale: string): Category[] {
  if (!response) return []

  const root = response as Record<string, unknown>
  const candidates = [root.data, root, extractList(root.data), extractList(root)]

  for (const candidate of candidates) {
    const list = extractList(candidate)
    if (list.length === 0) continue

    const parsed = list
      .map((item) => parseCategory(item as Record<string, unknown>, locale))
      .filter((item): item is Category => item !== null)

    if (parsed.length > 0) return parsed
  }

  return []
}

async function fetchCategoriesFromEndpoint(
  endpoint: string,
  locale: string,
  token?: string
): Promise<Category[]> {
  const response = await api.get<unknown>(endpoint, {
    locale,
    token,
    next: { revalidate: 60 },
  })
  return parseCategoriesResponse(response, locale)
}

export async function getCategories(
  locale = "ar",
  token?: string
): Promise<Category[]> {
  const endpoints = ["/categories", "/public/categories"]

  for (const endpoint of endpoints) {
    try {
      const parsed = await fetchCategoriesFromEndpoint(endpoint, locale, token)
      if (parsed.length > 0) return parsed
    } catch (err) {
      console.error(err)
      // try next endpoint
    }
  }

  try {
    const response = await api.get<ApiResponse<unknown>>("/public/categories", {
      locale,
      token,
      next: { revalidate: 60 },
    })
    const parsed = parseCategoriesResponse(response, locale)
    if (parsed.length > 0) return parsed
  } catch (err) {
    console.error(err)
    // fall through
  }

  return []
}

// Get raw categories with all fields preserved (for admin editors)
export async function getCategoriesRaw(locale?: string, token?: string): Promise<any[]> {
  try {
    const response = await api.get<unknown>("/categories", { locale, token })
    if (!response || typeof response !== "object") return []

    const root = response as Record<string, unknown>
    const list = Array.isArray(root.data) ? root.data : Array.isArray(response) ? response : []

    return list
  } catch (err) {
    console.error("[getCategoriesRaw] error:", err)
    return []
  }
}

/** Categories for forms: API first, then home payload, with optional auth. */
export async function getCategoriesForForm(
  locale = "ar",
  token?: string
): Promise<Category[]> {
  const fromApi = await getCategories(locale, token)
  if (fromApi.length > 0) return fromApi

  try {
    const home = await getHomeData(locale)
    if (home.categories?.length) return home.categories
  } catch (err) {
    console.error(err)
    // ignore
  }

  return []
}

/** Admin: create a new category */
export async function createCategoryAdmin(
  formData: FormData,
  token: string,
  locale = "ar"
): Promise<void> {
  await api.post<unknown>("/categories", formData, { token, locale })
}

/** Admin: update an existing category */
export async function updateCategoryAdmin(
  id: number,
  formData: FormData,
  token: string,
  locale = "ar"
): Promise<void> {
  // Backend accepts POST /categories with `id` in FormData for updates
  if (!formData.has("id")) formData.append("id", String(id))
  await api.post<unknown>(`/categories`, formData, { token, locale })
}

/** Admin: delete a category */
export async function deleteCategoryAdmin(
  id: number,
  token: string,
  locale = "ar"
): Promise<void> {
  await api.delete(`/categories/${id}`, { token, locale })
}
