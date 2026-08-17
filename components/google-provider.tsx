"use client"

import { GoogleOAuthProvider } from '@react-oauth/google'
import React from 'react'

export function GoogleProvider({ children }: { children: React.ReactNode }) {
  // Use a fallback or the environment variable. It's recommended to set this in .env
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER.apps.googleusercontent.com"
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  )
}
