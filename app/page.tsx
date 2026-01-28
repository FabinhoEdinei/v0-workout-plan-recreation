"use client"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      const supabase = await createClient()
      const { data } = await supabase.auth.getUser()

      if (data?.user) {
        router.push("/treino")
      } else {
        router.push("/login")
      }
    }

    checkUser()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando...</p>
      </div>
    </div>
  )
}
