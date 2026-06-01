// lib/api/types.ts

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

export interface UserProfile {
  firstName?: string | null
  lastName?: string | null
  gender?: string | null
  dateOfBirth?: string | null
  facebook?: string | null
  linkedin?: string | null
  twitterX?: string | null
  pinterest?: string | null
  categoryId?: number | null
  subcategoryId?: number | null
}

export interface CompanyProfileData {
  companyName?: string | null
  ceoName?: string | null
  description?: string | null
  website?: string | null
  postalCode?: string | null
  address?: string | null
  numOfEmployees?: number | null
  logoUrl?: string | null
  coverImageUrl?: string | null
  socialMedia?: {
    facebook?: string | null
    linkedin?: string | null
    twitterX?: string | null
    pinterest?: string | null
  }
}

export interface User {
  id: number
  uuid?: string
  name: string
  email: string
  phone?: string
  avatar?: string
  status?: "active" | "pending" | "inactive"
  emailVerified?: boolean
  lastLoginAt?: string | null
  locale?: "ar" | "en" | "de"
  timezone?: string
  preferences?: UserPreferences | null
  acceptTermsAndPrivacy?: boolean
  companyProfile?: CompanyProfileData | null
  Userprofile?: UserProfile | null
  country?: Country
  city?: City | null
  roles?: string[]
  createdAt?: string
  updatedAt?: string
  /** Legacy field - use roles instead */
  role?: "user" | "company" | "admin"
}

export interface UserPreferences {
  language?: "ar" | "en" | "de"
  notifications?: boolean
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: "Bearer"
  expires_in: number
}

export interface Job {
  id: number
  title: string | Record<string, string>
  description?: string | Record<string, string>
  requirements?: string | Record<string, string>
  responsibilities?: string | Record<string, string>
  image?: string
  salary_from?: number
  salary_to?: number
  age_from?: number
  age_to?: number
  vacancy?: number
  gender?: string
  employment_type?: string
  state?: string
  application_deadline?: string
  location?: string
  city?: City
  country?: Country
  category?: Category
  sub_category?: SubCategory
  company?: CompanyProfile
  status: "pending" | "approved" | "rejected" | "stopped" | "active"
  created_at: string
  created_at_human?: string
  applications_count?: number
}

export type PublicJobDetail = {
  job: Job
  related: Job[]
}

export interface JobApplication {
  id: number
  job: Job
  user: User
  status: "pending" | "accepted" | "rejected"
  applied_at: string
  cv_url?: string
}

export interface News {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string
  image?: string
  published_at: string
}

export interface SubCategory {
  id: number
  name: string
  slug?: string
}

export interface Category {
  id: number
  name: string
  slug: string
  icon?: string
  jobs_count?: number
  sub_categories?: SubCategory[]
}

export interface Country {
  id: number
  name: string
  code: string
  flag?: string
}

export interface City {
  id: number
  name: string
  country: Country
}

export interface CompanyProfile {
  id: number
  name: string
  logo?: string
  description: string
  company_type: CompanyType
  country: Country
  city: City
  website?: string
}

export interface CompanyType {
  id: number
  name: string
}

export interface Ticket {
  id: number
  subject: string
  status: "open" | "closed" | "pending"
  created_at: string
  replies?: TicketReply[]
}

export interface TicketReply {
  id: number
  message: string
  user: User
  created_at: string
}

export interface Notification {
  id: number
  title: string
  body: string
  read_at?: string
  created_at: string
  data?: Record<string, unknown>
}

export interface HomeData {
  hero: {
    title: string
    description: string
    stats: { value: string; label: string }[]
  }
  categories: Category[]
  featured_jobs: Job[]
  testimonials: Testimonial[]
  news: News[]
}

export interface Testimonial {
  id: number
  name: string
  position: string
  avatar?: string
  content: string
  rating: number
}

export interface SuccessStory {
  id: number
  name: string
  role: string
  location?: string
  quote: string
  image?: string | null
  image_url?: string | null
  is_active?: boolean
  sort_order?: number
  created_at?: string
  updated_at?: string
}

export interface About {
  title: string
  description: string
  mission: string
  vision: string
  stats: { value: string; label: string }[]
  team?: TeamMember[]
}

export interface TeamMember {
  id: number
  name: string
  position: string
  avatar?: string
}

export interface Education {
  id: number
  degree: string
  institution: string
  field_of_study: string
  start_date: string
  end_date?: string
  grade?: number
  description?: string
  document_url?: string
}

export interface Experience {
  id: number
  job_title: string
  company: string
  employment_type?: string
  start_date: string
  end_date?: string
  is_current?: boolean
  description?: string
  location?: string
}

export interface Language {
  id: number
  name: string
  proficiency: "beginner" | "intermediate" | "fluent" | "native"
}

export interface Skill {
  id: number
  name: string
  endorsements?: number
}

export interface UserPortfolio {
  cv_url?: string
  educations?: Education[]
  experiences?: Experience[]
  languages?: Language[]
  skills?: Skill[]
}
