import type React from "react"
import type { Metadata } from "next"
import { Orbitron, Share_Tech_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import HomeIcon from '@/public/icons/home.svg';
 // Adjust path
// In nav JSX: <HomeIcon className="h-6 w-6" title="Home 🏠" />


const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
})

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-share-tech-mono",
})

export const metadata: Metadata = {
  title: "TREINO 2026 - Workout Schedule",
  description: "Futuristic workout training schedule",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${orbitron.variable} ${shareTechMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
<Link href="/" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
  <HomeIcon className="h-6 w-6 text-blue-500" aria-label="🏠 Home" />
  <span>Home</span>
</Link>
      </body>
    </html>
  )
}
