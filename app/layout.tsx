import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/lib/i18n/language-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Soccer Competition App",
    description: "Manage soccer competitions with your friends",
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <LanguageProvider>{children}</LanguageProvider>
        </body>
        </html>
    )
}