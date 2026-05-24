"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import {
  staggerContainerVariants,
  staggerItemVariants,
  staggerViewport,
} from "@/components/motion/stagger-variants"

type StaggerInViewProps = {
  children: React.ReactNode
  className?: string
  leadDelay?: number
  /** Skip scroll-reveal (content always visible — fixes opacity on mobile) */
  immediate?: boolean
}

type StaggerItemProps = {
  children: React.ReactNode
  className?: string
  immediate?: boolean
}

export function StaggerInView({
  children,
  className,
  leadDelay = 0.18,
  immediate = false,
}: StaggerInViewProps) {
  if (immediate) {
    return <div className={cn("overflow-x-hidden", className)}>{children}</div>
  }

  const containerVariants = {
    ...staggerContainerVariants,
    visible: {
      ...staggerContainerVariants.visible,
      transition: {
        delayChildren: leadDelay,
        staggerChildren: 0.08,
      },
    },
  }

  return (
    <motion.div
      className={cn("overflow-x-hidden", className)}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ ...staggerViewport, amount: 0.2, margin: "0px 0px -4% 0px" }}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className, immediate = false }: StaggerItemProps) {
  if (immediate) {
    return <div className={cn("overflow-x-hidden", className)}>{children}</div>
  }

  return (
    <motion.div
      className={cn("overflow-x-hidden", className)}
      variants={staggerItemVariants}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  )
}
