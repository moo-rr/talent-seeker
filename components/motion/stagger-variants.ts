import type { Variants } from "motion/react"

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.18,
      staggerChildren: 0.08,
    },
  },
}

export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      opacity: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
      y: { type: "spring", damping: 28, stiffness: 64, mass: 0.9 },
    },
  },
}

/** Trigger once the block is largely visible, while keeping the reveal fast and stable on mobile. */
export const staggerViewport = {
  once: true,
  amount: 0.2,
  margin: "0px 0px -4% 0px",
} as const
