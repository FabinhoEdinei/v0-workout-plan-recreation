"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { LogOut, Dumbbell } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        window.location.href = "/login"
        return
      }

      setUserEmail(data.session.user.email)
      setLoading(false)
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#030a14] flex items-center justify-center">
        <div className="text-cyan-400 font-mono animate-pulse">CARREGANDO...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#030a14] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Dumbbell size={48} className="text-cyan-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Bem-vindo!</h1>
          <p className="text-cyan-300">{userEmail}</p>
        </div>

        <div className="space-y-4">
          <Link
            href="/treino"
            className="block w-full px-6 py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition-colors text-center"
          >
            Ir para Treino
          </Link>

          <button
            onClick={handleLogout}
            className="w-full px-6 py-3 bg-red-500/20 text-red-400 rounded-lg font-semibold hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </main>
  )
}