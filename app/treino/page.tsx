"use client"

import { useState, useEffect } from "react"
import { TreinoSchedule } from "@/components/treino-schedule"
import { createClient } from "@/lib/supabase/client"

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
      <TreinoSchedule userEmail={userEmail} />
    </main>
  )
}
