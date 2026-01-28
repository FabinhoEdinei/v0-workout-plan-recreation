import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function Home() {
  const supabase = await createClient()

  const { data } = await supabase.auth.getUser()

  if (data?.user) {
    redirect("/treino")
  } else {
    redirect("/login")
  }
}
