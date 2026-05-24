import { cn } from "@/lib/utils"

type IconProps = { className?: string }

export function NewsExportIcon({ className }: IconProps) {
  return (
    <svg className={cn("h-6 w-6 shrink-0 rtl:-scale-x-100", className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g opacity="0.4">
        <path
          d="M13 10.9998L21.2 2.7998"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21.9999 6.83V2H17.1699"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

export function NewsCalendarIcon({ className }: IconProps) {
  return (
    <svg className={cn("h-6 w-6 shrink-0", className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16.75 3.56V2C16.75 1.59 16.41 1.25 16 1.25C15.59 1.25 15.25 1.59 15.25 2V3.5H8.74998V2C8.74998 1.59 8.40998 1.25 7.99998 1.25C7.58998 1.25 7.24998 1.59 7.24998 2V3.56C4.54998 3.81 3.23999 5.42 3.03999 7.81C3.01999 8.1 3.25999 8.34 3.53999 8.34H20.46C20.75 8.34 20.99 8.09 20.96 7.81C20.76 5.42 19.45 3.81 16.75 3.56Z"
        fill="currentColor"
      />
      <g opacity="0.4">
        <path
          d="M20 9.83984C20.55 9.83984 21 10.2898 21 10.8398V16.9998C21 19.9998 19.5 21.9998 16 21.9998H8C4.5 21.9998 3 19.9998 3 16.9998V10.8398C3 10.2898 3.45 9.83984 4 9.83984H20Z"
          fill="currentColor"
        />
      </g>
      <path
        d="M8.5 14.9999C8.24 14.9999 7.98 14.8899 7.79 14.7099C7.61 14.5199 7.5 14.2599 7.5 13.9999C7.5 13.7399 7.61 13.4799 7.79 13.2899C8.07 13.0099 8.51 12.9199 8.88 13.0799C9.01 13.1299 9.12 13.1999 9.21 13.2899C9.39 13.4799 9.5 13.7399 9.5 13.9999C9.5 14.2599 9.39 14.5199 9.21 14.7099C9.02 14.8899 8.76 14.9999 8.5 14.9999Z"
        fill="currentColor"
      />
      <path
        d="M12 14.9999C11.74 14.9999 11.48 14.8899 11.29 14.7099C11.11 14.5199 11 14.2599 11 13.9999C11 13.7399 11.11 13.4799 11.29 13.2899C11.38 13.1999 11.49 13.1299 11.62 13.0799C11.99 12.9199 12.43 13.0099 12.71 13.2899C12.89 13.4799 13 13.7399 13 13.9999C13 14.2599 12.89 14.5199 12.71 14.7099C12.52 14.8899 12.26 14.9999 12 14.9999Z"
        fill="currentColor"
      />
      <path
        d="M15.5 15C15.24 15 14.98 14.89 14.79 14.71C14.61 14.52 14.5 14.26 14.5 14C14.5 13.74 14.61 13.48 14.79 13.29C14.89 13.2 14.99 13.13 15.12 13.08C15.3 13 15.5 12.98 15.7 13.02C15.76 13.03 15.82 13.05 15.88 13.08C15.94 13.1 16 13.13 16.06 13.17C16.11 13.21 16.16 13.25 16.21 13.29C16.39 13.48 16.5 13.74 16.5 14C16.5 14.26 16.39 14.52 16.21 14.71C16.02 14.89 15.76 15 15.5 15Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function NewsEyebrowGlobe({ className }: IconProps) {
  return (
    <svg className={cn("h-4 w-4 shrink-0", className)} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7.75" stroke="currentColor" strokeWidth="0.5" />
      <ellipse cx="8" cy="8" rx="3" ry="7" stroke="currentColor" strokeWidth="0.75" />
      <path d="M1.5 8h13" stroke="currentColor" strokeWidth="0.75" />
      <path d="M3 5h10M3 11h10" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  )
}
