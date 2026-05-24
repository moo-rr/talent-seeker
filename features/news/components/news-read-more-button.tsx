import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import { NewsExportIcon } from "@/features/news/components/news-icons"
import { PrimaryButton } from "@/components/ui/primary-button"

type NewsReadMoreButtonProps = {
  href: string
  label: string
  className?: string
}

export function NewsReadMoreButton({ href, label, className }: NewsReadMoreButtonProps) {
  return (
    <PrimaryButton
      asChild
      className={cn("flex items-center justify-center  h-[52px] w-[220px] ",        className
      )}
    >
      <Link href={href} className="inline-flex items-center justify-center gap-2">
        <NewsExportIcon />
        <span>{label}</span>
      </Link>
    </PrimaryButton>
  )
}
