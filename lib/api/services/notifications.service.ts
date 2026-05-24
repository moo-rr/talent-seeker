// lib/api/services/notifications.service.ts
import { api } from "../client"
import type { ApiResponse, Notification, PaginationMeta } from "../types"

function pickLocalizedString(value: unknown, locale?: string): string {
  if (typeof value === "string") return value
  if (value && typeof value === "object") {
    const map = value as Record<string, string>
    if (locale && map[locale]) return map[locale]
    return map.ar ?? map.en ?? map.de ?? Object.values(map).find((v) => typeof v === "string") ?? ""
  }
  return ""
}

function extractNotificationsList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw
  if (!raw || typeof raw !== "object") return []

  const obj = raw as Record<string, unknown>
  if (Array.isArray(obj.data)) return obj.data
  if (Array.isArray(obj.items)) return obj.items
  if (Array.isArray(obj.notifications)) return obj.notifications

  return []
}

function normalizeNotification(item: unknown, index: number, locale?: string): Notification | null {
  if (!item || typeof item !== "object") return null

  const row = item as Record<string, unknown>
  const id = typeof row.id === "number" ? row.id : index + 1

  const title = pickLocalizedString(row.title, locale)
  const body = pickLocalizedString(row.body ?? row.content ?? row.message, locale)

  const created_at =
    (typeof row.created_at === "string" && row.created_at) ||
    new Date().toISOString()

  const read_at = typeof row.read_at === "string" ? row.read_at : undefined

  if (!title && !body) return null

  return {
    id,
    title: title || "—",
    body: body || "",
    read_at,
    created_at,
    data: (row.data as Record<string, unknown>) ?? undefined,
  }
}

function parseNotificationsResponse(response: unknown, locale?: string): {
  data: Notification[]
  meta?: PaginationMeta
} {
  if (!response || typeof response !== "object") {
    return { data: [] }
  }

  const root = response as Record<string, unknown>
  const meta = root.meta as PaginationMeta | undefined

  const candidates = [root.data, root, extractNotificationsList(root.data)]

  for (const candidate of candidates) {
    const list = extractNotificationsList(candidate)
    if (list.length === 0) continue

    const data = list
      .map((item, index) => normalizeNotification(item, index, locale))
      .filter((item): item is Notification => item !== null)

    return { data, meta }
  }

  return { data: [], meta }
}

export async function getNotifications(
  token: string,
  page = 1,
  locale = "ar"
): Promise<{ data: Notification[]; meta?: PaginationMeta }> {
  try {
    const response = await api.get<unknown>(
      `/notifications?page=${page}`,
      { token, locale }
    )
    return parseNotificationsResponse(response, locale)
  } catch (err) {
    console.error("[getNotifications] error:", err)
    return { data: [] }
  }
}

export async function markAsRead(
  notificationId: number,
  token: string,
  locale = "ar"
): Promise<Notification> {
  const response = await api.post<ApiResponse<unknown>>(
    `/notifications/${notificationId}/read`,
    {},
    { token, locale }
  )
  const root = response.data ?? response
  return normalizeNotification(root, 0, locale) ?? {
    id: notificationId,
    title: "",
    body: "",
    created_at: new Date().toISOString(),
  }
}

export async function markAllAsRead(
  token: string,
  locale = "ar"
): Promise<void> {
  await api.post("/notifications/read-all", {}, { token, locale })
}

export async function deleteNotification(
  notificationId: number,
  token: string,
  locale = "ar"
): Promise<void> {
  await api.delete(`/notifications/${notificationId}`, { token, locale })
}

export async function getUnreadCount(
  token: string,
  locale = "ar"
): Promise<{ unread_count: number }> {
  try {
    const response = await api.get<ApiResponse<{ unread_count: number }>>(
      "/notifications/unread-count",
      { token, locale }
    )
    return response.data ?? { unread_count: 0 }
  } catch (err) {
    console.error("[getUnreadCount] error:", err)
    return { unread_count: 0 }
  }
}
