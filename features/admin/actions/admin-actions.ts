"use server"

import { revalidatePath } from "next/cache"
import { approveJob, rejectJob, deleteUser } from "@/lib/api/services/admin.service"
import {
  createSuccessStory,
  deleteSuccessStory,
  updateSuccessStory,
} from "@/lib/api/services/success-stories.service"
import {
  createNewsItem,
  deleteNewsItem,
  updateNewsItem,
} from "@/lib/api/services/news.service"
import { updateSetting } from "@/lib/api/services/settings.service"
import { updateAbout } from "../../../lib/api/services/about.service"
import {
  deleteNotification,
  markAllAsRead,
  markAsRead,
} from "@/lib/api/services/notifications.service"
import { ApiError } from "@/lib/api/client"
import { getSession } from "@/lib/session"

async function requireAdmin(locale: string) {
  const session = await getSession()
  if (!session.accessToken || session.user?.role !== "admin") {
    throw new Error("Unauthorized")
  }
  return { token: session.accessToken, locale }
}

function revalidateAdmin(locale: string) {
  const base = `/${locale}/dashboard/admin`
  revalidatePath(base)
  revalidatePath(`${base}/jobs`)
  revalidatePath(`${base}/users`)
  revalidatePath(`${base}/companies`)
  revalidatePath(`${base}/success-stories`)
  revalidatePath(`${base}/settings`)
  revalidatePath(`/${locale}`)
}

export async function approveJobAction(jobId: number, locale: string) {
  try {
    const { token } = await requireAdmin(locale)
    await approveJob(jobId, token, locale)
    revalidateAdmin(locale)
    return { ok: true as const }
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Failed to approve"
    return { ok: false as const, message }
  }
}

export async function rejectJobAction(jobId: number, locale: string, reason?: string) {
  try {
    const { token } = await requireAdmin(locale)
    await rejectJob(jobId, token, locale, reason)
    revalidateAdmin(locale)
    return { ok: true as const }
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Failed to reject"
    return { ok: false as const, message }
  }
}

export async function deleteUserAction(userId: number | string, locale: string) {
  try {
    const { token } = await requireAdmin(locale)
    await deleteUser(userId, token, locale)
    revalidateAdmin(locale)
    return { ok: true as const }
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Failed to delete user"
    return { ok: false as const, message }
  }
}

export async function deleteSuccessStoryAction(id: number, locale: string) {
  try {
    const { token } = await requireAdmin(locale)
    await deleteSuccessStory(id, token, locale)
    revalidatePath(`/${locale}/dashboard/admin/success-stories`)
    revalidatePath(`/${locale}`)
    return { ok: true as const }
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Failed to delete"
    return { ok: false as const, message }
  }
}

export async function saveSuccessStoryAction(formData: FormData, locale: string, storyId?: number) {
  try {
    // server-side fast-fail: ensure location for current locale is present
    const locKey = `location[${locale}]`
    const locVal = formData.get(locKey)
    if (!locVal || String(locVal).trim() === "") {
      return { ok: false as const, message: "Location required" }
    }
    const { token } = await requireAdmin(locale)
    if (storyId) {
      await updateSuccessStory(storyId, formData, token, locale)
    } else {
      await createSuccessStory(formData, token, locale)
    }
    revalidatePath(`/${locale}/dashboard/admin/success-stories`)
    revalidatePath(`/${locale}`)
    return { ok: true as const }
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Failed to save story"
    return { ok: false as const, message }
  }
}

export async function saveNewsAction(formData: FormData, locale: string, newsId?: number) {
  try {
    const { token } = await requireAdmin(locale)
    if (newsId) {
      await updateNewsItem(newsId, formData, token, locale)
    } else {
      await createNewsItem(formData, token, locale)
    }
    revalidatePath(`/${locale}/dashboard/admin/news`)
    revalidatePath(`/${locale}/news`)
    return { ok: true as const }
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Failed to save news"
    return { ok: false as const, message }
  }
}

export async function deleteNewsAction(id: number, locale: string) {
  try {
    const { token } = await requireAdmin(locale)
    await deleteNewsItem(id, token, locale)
    revalidatePath(`/${locale}/dashboard/admin/news`)
    revalidatePath(`/${locale}/news`)
    return { ok: true as const }
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Failed to delete news"
    return { ok: false as const, message }
  }
}

export async function saveSettingAction(key: string, formData: FormData, locale: string) {
  try {
    const { token } = await requireAdmin(locale)
    await updateSetting(key, formData, token, locale)
    revalidatePath(`/${locale}/dashboard/admin/settings`)
    return { ok: true as const }
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Failed to save setting"
    return { ok: false as const, message }
  }
}

export async function saveAboutAction(formData: FormData, locale: string) {
  try {
    const { token } = await requireAdmin(locale)
    await updateAbout(formData, token, locale)
    revalidatePath(`/${locale}/about`)
    revalidatePath(`/${locale}/dashboard/admin/about`)
    return { ok: true as const }
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Failed to save about page"
    return { ok: false as const, message }
  }
}

export async function markNotificationReadAction(id: number, locale: string) {
  try {
    const { token } = await requireAdmin(locale)
    await markAsRead(id, token, locale)
    revalidatePath(`/${locale}/dashboard/admin/notifications`)
    return { ok: true as const }
  } catch {
    return { ok: false as const, message: "Failed" }
  }
}

export async function markAllNotificationsReadAction(locale: string) {
  try {
    const { token } = await requireAdmin(locale)
    await markAllAsRead(token, locale)
    revalidatePath(`/${locale}/dashboard/admin/notifications`)
    return { ok: true as const }
  } catch {
    return { ok: false as const, message: "Failed" }
  }
}

export async function deleteNotificationAction(id: number, locale: string) {
  try {
    const { token } = await requireAdmin(locale)
    await deleteNotification(id, token, locale)
    revalidatePath(`/${locale}/dashboard/admin/notifications`)
    return { ok: true as const }
  } catch {
    return { ok: false as const, message: "Failed" }
  }
}
