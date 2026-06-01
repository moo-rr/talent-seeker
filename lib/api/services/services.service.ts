import { api } from "../client"

export interface ServiceFeature {
  id: number
  title: string
  description: string
  icon?: string
  sortOrder?: number
}

export interface Service {
  id: number
  title: string
  description: string
  icon?: string
  image?: string
  features: ServiceFeature[]
}

function pickLocalizedString(value: unknown, locale = "ar"): string {
  if (typeof value === "string") return value
  if (!value || typeof value !== "object") return ""

  const map = value as Record<string, unknown>
  const priority = [locale, "ar", "en", "de"]

  for (const key of priority) {
    const candidate = map[key]
    if (typeof candidate === "string" && candidate.trim()) return candidate
  }

  for (const candidate of Object.values(map)) {
    if (typeof candidate === "string" && candidate.trim()) return candidate
  }

  return ""
}

function normalizeFeature(item: unknown, locale = "ar"): ServiceFeature | null {
  if (!item || typeof item !== "object") return null

  const row = item as Record<string, unknown>
  const title = pickLocalizedString(row.title, locale)
  const description = pickLocalizedString(row.description ?? row.content, locale)

  if (!title) return null

  return {
    id: typeof row.id === "number" ? row.id : 0,
    title,
    description,
    icon: typeof row.icon === "string" ? row.icon : undefined,
    sortOrder:
      typeof row.sortOrder === "number"
        ? row.sortOrder
        : typeof row.sort_order === "number"
          ? row.sort_order
          : undefined,
  }
}

function normalizeService(item: unknown, locale = "ar"): Service | null {
  if (!item || typeof item !== "object") return null

  const row = item as Record<string, unknown>
  const title = pickLocalizedString(row.title, locale)
  const description = pickLocalizedString(row.description ?? row.content, locale)

  if (!title) return null

  const rawFeatures = row.features
  const features: ServiceFeature[] = []
  if (Array.isArray(rawFeatures)) {
    for (const f of rawFeatures) {
      const parsed = normalizeFeature(f, locale)
      if (parsed) features.push(parsed)
    }
  }

  return {
    id: typeof row.id === "number" ? row.id : 0,
    title,
    description,
    icon: typeof row.icon === "string" ? row.icon : undefined,
    image: typeof row.image === "string" ? row.image : undefined,
    features,
  }
}

export async function getServices(locale = "ar"): Promise<Service[]> {
  try {
    const response = await api.get<unknown>("/service", { locale })
    if (!response || typeof response !== "object") return []

    const root = response as Record<string, unknown>
    const list = Array.isArray(root.data) ? root.data : Array.isArray(response) ? response : []

    return list
      .map((item) => normalizeService(item, locale))
      .filter((s): s is Service => s !== null)
  } catch (err) {
    console.error("[getServices] error:", err)
    return []
  }
}

// Get raw service data with all language versions preserved (for editing)
export async function getServicesRaw(locale?: string): Promise<any[]> {
  try {
    const response = await api.get<unknown>("/service", { locale })
    if (!response || typeof response !== "object") return []

    const root = response as Record<string, unknown>
    const list = Array.isArray(root.data) ? root.data : Array.isArray(response) ? response : []

    return list
  } catch (err) {
    console.error("[getServicesRaw] error:", err)
    return []
  }
}

export async function createServiceAdmin(
  formData: FormData,
  token: string,
  locale = "ar"
): Promise<void> {
  await api.post<unknown>("/service", formData, { token, locale })
}

export async function updateServiceAdmin(
  id: number,
  formData: FormData,
  token: string,
  locale = "ar"
): Promise<void> {
  // Some backends expect update via the same `/service` endpoint (POST with id in payload).
  // Ensure `id` exists in the form data and use the canonical `/service` POST endpoint.
  if (!formData.has("id")) formData.append("id", String(id))
  await api.post<unknown>(`/service`, formData, { token, locale })
}

export async function deleteServiceAdmin(
  id: number,
  token: string,
  locale = "ar"
): Promise<void> {
  await api.delete(`/service/${id}`, { token, locale })
}
