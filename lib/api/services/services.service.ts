import { api } from "../client"

export interface Service {
  id: number
  title: string
  description: string
  icon?: string
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

function normalizeService(item: unknown, locale = "ar"): Service | null {
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
