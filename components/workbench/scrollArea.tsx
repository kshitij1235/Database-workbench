import type React from "react"
import { cn } from "@/lib/utils"

interface CustomScrollAreaProps {
  className?: string
  children: React.ReactNode
}

export function CustomScrollArea({ className, children }: CustomScrollAreaProps) {
  return <div className={cn("overflow-auto", className)}>{children}</div>
}

