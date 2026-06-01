// lib/api/services/admin.service.ts
import { api, ApiError } from "../client"
import type { ApiResponse, Job, JobApplication, User, PaginationMeta } from "../types"
import { normalizeJob } from "./jobs.service"

const ADMIN_JOB_STATUSES = ["pending", "approved", "active", "rejected"] as const

export async function getAdminJobs(
  token: string,
  status?: string,
  page = 1,
  locale = "ar"
): Promise<{ data: Job[]; meta: PaginationMeta }> {
  const query = status ? `?status=${status}&page=${page}` : `?page=${page}`
  const response = await api.get<ApiResponse<unknown>>(
    `/admin/jobs${query}`,
    { token, locale }
  )
  const rawList = response.data || []
  const data = (Array.isArray(rawList) ? rawList : [])
    .map((item) => normalizeJob(item, locale))
    .filter((item): item is Job => item !== null)
  return { data, meta: response.meta! }
}

export async function getAdminJobById(
  jobId: number,
  token: string,
  locale = "ar"
): Promise<Job | null> {
  try {
    for (const status of ADMIN_JOB_STATUSES) {
      let page = 1
      let hasMore = true

      while (hasMore) {
        const { data, meta } = await getAdminJobs(token, status, page, locale)
        const job = data.find((entry) => entry.id === jobId)

        if (job) {
          return job
        }

        hasMore = meta.last_page > page
        page += 1
      }
    }

    return null
  } catch (error) {
    console.error("[Admin Service] getAdminJobById error:", error)
    return null
  }
}

export async function getAdminJobApplications(
  jobId: number,
  token: string,
  page = 1,
  locale = "ar"
): Promise<{ data: JobApplication[]; meta: PaginationMeta }> {
  try {
    const response = await api.get<unknown>(
      `/admin/job-applications?job_id=${jobId}&page=${page}`,
      { token, locale }
    )

    const typedResponse = response as
      | { data?: JobApplication[]; meta?: PaginationMeta }
      | JobApplication[]
      | undefined

    const data = Array.isArray(typedResponse)
      ? typedResponse
      : Array.isArray(typedResponse?.data)
        ? typedResponse.data
        : []

    const meta = Array.isArray(typedResponse)
      ? {
          current_page: page,
          last_page: 1,
          per_page: 10,
          total: data.length,
        }
      : typedResponse?.meta || {
          current_page: page,
          last_page: 1,
          per_page: 10,
          total: data.length,
        }

    return { data, meta }
  } catch (error) {
    console.error("[Admin Service] getAdminJobApplications error:", error)
    throw error
  }
}

export async function approveJob(
  jobId: number,
  token: string,
  locale = "ar"
): Promise<Job> {
  const response = await api.patch<ApiResponse<Job>>(
    `/admin/jobs/${jobId}/approve`,
    {},
    { token, locale }
  )
  return response.data
}

export async function rejectJob(
  jobId: number,
  token: string,
  locale = "ar",
  reason?: string
): Promise<Job> {
  const response = await api.patch<ApiResponse<Job>>(
    `/admin/jobs/${jobId}/reject`,
    reason ? { reason } : {},
    { token, locale }
  )
  return response.data
}

export async function deleteUser(
  userId: number | string,
  token: string,
  locale = "ar"
): Promise<void> {
  await api.delete(`/users/${userId}`, { token, locale })
}

export async function getAdminJobApplicationStats(
  token: string,
  locale = "ar"
): Promise<{ total?: number; pending?: number; approved?: number; rejected?: number }> {
  try {
    const response = await api.get<
      ApiResponse<{ total?: number; pending?: number; approved?: number; rejected?: number }>
    >("/admin/job-applications/stats", { token, locale })
    return response.data
  } catch (err) {
    console.error(err)
    return {}
  }
}

export async function getAdminUsers(
  token: string,
  role?: string,
  page = 1,
  locale = "ar"
): Promise<{ data: User[]; meta: PaginationMeta }> {
  const query = role ? `?role=${role}&page=${page}` : `?page=${page}`

  function matchesRole(u: User, wanted?: string) {
    if (!wanted) return true
    if (typeof (u as any).role === "string") return (u as any).role === wanted
    if (Array.isArray((u as any).roles)) {
      return (u as any).roles.some((r: any) => {
        if (typeof r === "string") return r === wanted
        if (r && typeof r === "object") {
          const rr = r as Record<string, unknown>
          return rr.name === wanted || rr.slug === wanted
        }
        return false
      })
    }
    return false
  }

  try {
    const response = await api.get<ApiResponse<User[]>>(`/admin/users${query}`, { token, locale })
    let data = response.data ?? []
    if (role) data = data.filter((u) => matchesRole(u, role))

    // If backend returned pagination meta, prefer and return it (it may contain
    // the accurate `total` count). Only fall back to computed totals when meta
    // is absent.
    if (response.meta) {
      const meta: PaginationMeta = {
        current_page: response.meta.current_page ?? page,
        last_page: response.meta.last_page ?? Math.max(1, Math.ceil((response.meta.total ?? data.length) / (response.meta.per_page ?? 10))),
        per_page: response.meta.per_page ?? 10,
        total: typeof response.meta.total === "number" ? response.meta.total : data.length,
      }
      return { data, meta }
    }

    const per_page = 10
    const meta: PaginationMeta = {
      current_page: page,
      last_page: Math.max(1, Math.ceil(data.length / per_page)),
      per_page,
      total: data.length,
    }

    return { data, meta }
  } catch (err) {
    // If the backend does not expose /admin/users, fall back to the public /users endpoint
    if (err instanceof ApiError && err.status === 404) {
      try {
        const fallback = await api.get<ApiResponse<User[]>>(`/users${query}`, { token, locale })
        let data = fallback.data ?? []
        if (role) data = data.filter((u) => matchesRole(u, role))

        if (fallback.meta) {
          const meta: PaginationMeta = {
            current_page: fallback.meta.current_page ?? page,
            last_page: fallback.meta.last_page ?? Math.max(1, Math.ceil((fallback.meta.total ?? data.length) / (fallback.meta.per_page ?? 10))),
            per_page: fallback.meta.per_page ?? 10,
            total: typeof fallback.meta.total === "number" ? fallback.meta.total : data.length,
          }
          return { data, meta }
        }

        const per_page = 10
        const meta: PaginationMeta = {
          current_page: page,
          last_page: Math.max(1, Math.ceil(data.length / per_page)),
          per_page,
          total: data.length,
        }

        return { data, meta }
      } catch (err2) {
        console.error("[Admin Service] getAdminUsers fallback error:", err2)
        return { data: [], meta: { current_page: page, last_page: 1, per_page: 10, total: 0 } }
      }
    }

    console.error("[Admin Service] getAdminUsers error:", err)
    throw err
  }
}

export async function getAdminStats(
  token: string,
  locale = "ar"
): Promise<{
  total_users: number
  total_companies: number
  total_jobs: number
  pending_jobs: number
}> {
  // Try the dedicated admin endpoint first. If it does not exist on the backend
  // (common in early integrations), fall back to deriving values from public
  // endpoints such as /users and /jobs.
  try {
    const response = await api.get<
      ApiResponse<{
        total_users: number
        total_companies: number
        total_jobs: number
        pending_jobs: number
      }>
    >("/admin/stats", { token, locale })
    return response.data
  } catch (err) {
    console.warn("/admin/stats not available, falling back to derived stats", err)

    function parseTotalFromResponse(resp: unknown): number {
      if (!resp) return 0
      if (Array.isArray(resp)) return resp.length
      try {
        const asObj = resp as Record<string, unknown>
        if (asObj.meta && typeof (asObj.meta as any).total === "number") return (asObj.meta as any).total
        if (asObj.data && Array.isArray(asObj.data)) return (asObj.data as any).length
        if (typeof asObj.total === "number") return asObj.total as number
      } catch {
        // ignore
      }
      return 0
    }

    try {
      const [usersResp, jobsResp] = await Promise.all([
        api.get<unknown>("/users?page=1&per_page=1", { token, locale }),
        api.get<unknown>("/jobs?page=1&per_page=1", { token, locale }),
      ])

      const totalUsers = parseTotalFromResponse(usersResp)
      const totalJobs = parseTotalFromResponse(jobsResp)

      let pendingJobs = 0
      try {
        const pendingResp = await api.get<unknown>("/jobs?status=pending&page=1&per_page=1", { token, locale })
        pendingJobs = parseTotalFromResponse(pendingResp)
      } catch {
        pendingJobs = 0
      }

      let totalCompanies = 0
      try {
        // Some backends expose companies as users with role=company
        const companiesResp = await api.get<unknown>("/users?role=company&page=1&per_page=1", { token, locale })
        totalCompanies = parseTotalFromResponse(companiesResp)
      } catch {
        totalCompanies = 0
      }

      return {
        total_users: Number(totalUsers || 0),
        total_companies: Number(totalCompanies || 0),
        total_jobs: Number(totalJobs || 0),
        pending_jobs: Number(pendingJobs || 0),
      }
    } catch (err2) {
      console.error("[Admin Service] getAdminStats fallback error:", err2)
      return { total_users: 0, total_companies: 0, total_jobs: 0, pending_jobs: 0 }
    }
  }
}
