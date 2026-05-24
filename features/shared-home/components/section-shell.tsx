import { cn } from "@/hooks/lib/utils"
import { SectionShellStagger } from "@/features/shared-home/components/section-shell-stagger"

export type SectionShellStaggerOptions = {
  leadDelay?: number
}

type SectionShellProps = {
  id?: string
  className?: string
  children: React.ReactNode
  /**
   * Scroll-reveal stagger for section content.
   * - `true` (default): stagger each direct child
   * - `false`: no animation (use when nesting manual StaggerInView)
   * - `{ leadDelay }`: custom delay before first child
   */
  stagger?: boolean | SectionShellStaggerOptions
}

export function SectionShell({ id, className, children, stagger = true }: SectionShellProps) {
  const leadDelay = typeof stagger === "object" ? stagger.leadDelay : undefined
  const content =
    stagger === false ? (
      children
    ) : (
      <SectionShellStagger leadDelay={leadDelay}>{children}</SectionShellStagger>
    )

  return (
    <section
      id={id}
      className={cn(
        "w-full px-4 sm:px-6 lg:px-[100px] overflow-x-hidden", // منع أي انفلات أفقي
        className
      )}
    >
      <div className="w-full max-w-[1312px] mx-auto overflow-x-hidden">{content}</div>
    </section>
  )
}
