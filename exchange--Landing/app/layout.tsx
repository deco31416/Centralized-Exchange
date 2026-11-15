import type React from "react"
import type { Metadata } from "next"
import "@/app/globals.css"
import { AuthProvider } from "@/components/p2p/auth-provider"
import { WelcomeModal } from "@/components/common/modals/WelcomeModal"
import { DevGuard } from "@/components/security/DevGuard"
import { GlobalClientWidgets } from "@/components/common/global-client-widgets"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "deco-exchange: Everything starts with one account.",
  description: "Operate, invest, and manage your assets through a secure, fast, and intuitive platform.",
  generator: "deco31416.com",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <DevGuard />
            <WelcomeModal />
            {children}
            <GlobalClientWidgets />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
