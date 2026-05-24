// lib/api/services/company.service.ts
import { api } from "../client"
import type { ApiResponse, Job, JobApplication, PaginationMeta } from "../types"
import {
  buildJobFormData,
  buildJobFormDataForUpdate,
} from "@/features/company-jobs/lib/build-job-form-data"

export type LocalizedText = { ar: string; en: string; de: string }

export interface CreateJobPayload {
  title: LocalizedText
  category_id: number
  sub_category_id: number
  state: string
  vacancy: number
  gender: "Male" | "Female" | "All"
  application_deadline: string
  salary_from: number
  salary_to: number
  age_from: number
  age_to: number
  description: LocalizedText
  responsibilities: LocalizedText
  requirements: LocalizedText
  image: File | Blob
}

export async function getCompanyJob(
  id: number,
  token: string,
  locale = "ar"
): Promise<Job | null> {
  try {
    const response = await api.get<ApiResponse<Job>>(`/jobs/${id}`, { token, locale })
    return response.data ?? (response as unknown as Job) ?? null
  } catch (error) {
    console.error("[Company Service] getCompanyJob error:", error)
    return null
  }
}

export async function getCompanyJobs(
  token: string,
  page = 1,
  locale = "ar"
): Promise<{ data: Job[]; meta: PaginationMeta }> {
  try {
    const response = await api.get<unknown>(`/jobs?page=${page}`, { token, locale })
    const typedResponse = response as
      | { data?: Job[]; meta?: PaginationMeta }
      | Job[]
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
    console.error("[Company Service] getCompanyJobs error:", error)
    throw error
  }
}

export async function createJob(
  payload: CreateJobPayload,
  token: string,
  locale = "ar"
): Promise<Job> {
  const formData = buildJobFormData(payload)
  const response = await api.post<ApiResponse<Job>>("/jobs", formData, { token, locale })
  return response.data ?? (response as unknown as Job)
}

export async function updateJob(
  id: number,
  payload: Partial<CreateJobPayload>,
  token: string,
  locale = "ar"
): Promise<Job> {
  const formData = buildJobFormDataForUpdate({
    title: payload.title ?? { ar: "", en: "", de: "" },
    category_id: payload.category_id ?? 0,
    sub_category_id: payload.sub_category_id ?? 0,
    state: payload.state ?? "",
    vacancy: payload.vacancy ?? 0,
    gender: payload.gender ?? "All",
    application_deadline: payload.application_deadline ?? "",
    salary_from: payload.salary_from ?? 0,
    salary_to: payload.salary_to ?? 0,
    age_from: payload.age_from ?? 0,
    age_to: payload.age_to ?? 0,
    description: payload.description ?? { ar: "", en: "", de: "" },
    responsibilities: payload.responsibilities ?? { ar: "", en: "", de: "" },
    requirements: payload.requirements ?? { ar: "", en: "", de: "" },
    image: payload.image,
  })
  const response = await api.post<ApiResponse<Job>>(`/jobs/${id}`, formData, {
    token,
    locale,
  })
  return response.data ?? (response as unknown as Job)
}

export async function deleteJob(
  id: number,
  token: string,
  locale = "ar"
): Promise<void> {
  await api.delete(`/jobs/${id}`, { token, locale })
}

export async function stopJob(
  id: number,
  token: string,
  locale = "ar"
): Promise<Job> {
  const response = await api.patch<ApiResponse<Job>>(`/jobs/${id}/stop`, undefined, {
    token,
    locale,
  })
  return response.data ?? (response as unknown as Job)
}

export async function getJobApplications(
  jobId: number,
  token: string,
  page = 1,
  locale = "ar"
): Promise<{ data: JobApplication[]; meta: PaginationMeta }> {
  // The backend exposes company applications via /company/applications?job_id=... according to Postman
  const response = await api.get<unknown>(
    `/company/applications?job_id=${jobId}&page=${page}`,
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
}

export async function updateApplicationStatus(
  applicationId: number,
  status: "accepted" | "rejected",
  token: string,
  locale = "ar"
): Promise<JobApplication> {
  // Backend expects company application status updates at /company/applications/:id/status
  const response = await api.patch<ApiResponse<JobApplication>>(
    `/company/applications/${applicationId}/status`,
    { status },
    { token, locale }
  )
  return response.data ?? (response as unknown as JobApplication)
}

export async function getCompanyStats(
  token: string,
  locale = "ar"
): Promise<{
  total_jobs: number
  total_applications: number
  pending_applications: number
}> {
  try {
    const response = await api.get<unknown>("/company/dashboard/stats", { token, locale })
    const typedResponse = response as { data?: Record<string, unknown> } | Record<string, unknown>
    const stats =
      typedResponse && typeof typedResponse === "object" && "data" in typedResponse
        ? typedResponse.data
        : typedResponse

    return {
      total_jobs: Number((stats as Record<string, unknown>)?.total_jobs || 0),
      total_applications: Number((stats as Record<string, unknown>)?.total_applications || 0),
      pending_applications: Number((stats as Record<string, unknown>)?.pending_applications || 0),
    }
  } catch (error) {
    console.error("[Company Service] getCompanyStats error:", error)
    return { total_jobs: 0, total_applications: 0, pending_applications: 0 }
  }
}
