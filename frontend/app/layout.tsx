import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { Footer } from "@/components/footer"
import { ScrollToTop } from "@/components/scroll-to-top"
import { ConfirmProvider } from "@/hooks/use-confirm"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Digital Library Management System",
  description: "A comprehensive online library management system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ConfirmProvider>
          <ScrollToTop />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Toaster /> 
          <Footer />
          </ConfirmProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
