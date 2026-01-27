"use client"

import { useState, useEffect } from "react"
import { TreinoSchedule } from "@/components/treino-schedule"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function TreinoPage() {
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()
      console.log("[v0] TreinoPage - session:", data.session?.user?.email)

      if (!data.session) {
        console.log("[v0] No session, redirecting to login")
        window.location.href = "/login"
        return
      }

      setUserEmail(data.session.user.email)
      setLoading(false)
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#030a14] flex items-center justify-center"> 
        <div className="text-cyan-400 font-mono animate-pulse">CARREGANDO TREINO...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#030a14] overflow-auto">
      {/* Barra superior com ícone home */}
      <div className="flex justify-end p-4 border-b border-cyan-500/20">
        <Link href="#" className="hover:opacity-80 transition-opacity">
          <img src="/icons/home.svg" alt="Home" width={24} height={24} className="text-cyan-400" />
        </Link>
      </div>
      <TreinoSchedule userEmail={userEmail} />
    </main>
  )
}