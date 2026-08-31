"use client"

import { usePathname } from "next/navigation"
import React from "react"

export default function AdminHide({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  if (pathname?.startsWith("/adminklitzo789789")) {
    return null
  }
  
  return <>{children}</>
}
