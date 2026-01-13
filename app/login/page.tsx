"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()
      console.log("[v0] Checking existing session:", data.session?.user?.email)
      if (data.session) {
        window.location.href = "/treino"
      } else {
        setCheckingAuth(false)
      }
    }
    checkAuth()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/treino`,
          },
        })
        if (error) throw error
        setError("Verifique seu email para confirmar o cadastro!")
      } else {
        console.log("[v0] Attempting login with:", email)
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          console.log("[v0] Login error:", error.message)
          throw error
        }
        console.log("[v0] Login successful, user:", data.user?.email)

        const { data: sessionData } = await supabase.auth.getSession()
        console.log("[v0] Session after login:", sessionData.session?.user?.email)

        if (sessionData.session) {
          console.log("[v0] Session confirmed, redirecting...")
          // Small delay to ensure cookies are set
          setTimeout(() => {
            window.location.href = "/treino"
          }, 100)
        } else {
          throw new Error("Sessão não foi criada corretamente")
        }
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao processar")
      setIsLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#030a14] flex items-center justify-center">
        <div className="text-cyan-400 font-mono animate-pulse">VERIFICANDO ACESSO...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030a14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 via-transparent to-cyan-900/10" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

      {/* Animated scan lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.02)_50%)] bg-[length:100%_4px]" />
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-md">
        {/* Corner accents */}
        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-cyan-400/70" />
        <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-cyan-400/70" />
        <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-cyan-400/70" />
        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-cyan-400/70" />

        <div className="bg-[#051525]/90 border border-cyan-400/30 p-8 glow-border">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-cyan-400 tracking-wider font-sans">TREINO 2026</h1>
            <div className="mt-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            <p className="text-cyan-300/70 mt-4 font-mono text-sm">
              {isSignUp ? "CRIAR NOVA CONTA" : "ACESSO AO SISTEMA"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            <div className="space-y-2">
              <label className="text-cyan-300/80 text-sm font-mono tracking-wider">EMAIL</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#0a2540]/50 border border-cyan-400/30 text-cyan-100 px-4 py-3 font-mono
                           focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,255,255,0.3)]
                           transition-all duration-300 placeholder:text-cyan-400/30"
                  placeholder="usuario@email.com"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400/50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="text-cyan-300/80 text-sm font-mono tracking-wider">SENHA</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#0a2540]/50 border border-cyan-400/30 text-cyan-100 px-4 py-3 font-mono
                           focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,255,255,0.3)]
                           transition-all duration-300 placeholder:text-cyan-400/30"
                  placeholder="••••••••"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400/50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Error/Success message */}
            {error && (
              <div
                className={`text-sm font-mono p-3 border ${
                  error.includes("Verifique")
                    ? "text-green-400 bg-green-400/10 border-green-400/30"
                    : "text-red-400 bg-red-400/10 border-red-400/30"
                }`}
              >
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-400/20 border border-cyan-400/50 text-cyan-300 py-3 font-mono tracking-wider
                       hover:bg-cyan-400/30 hover:border-cyan-400 hover:text-cyan-100 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10">{isLoading ? "PROCESSANDO..." : isSignUp ? "CADASTRAR" : "ENTRAR"}</span>
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent 
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
              />
            </button>
          </form>

          {/* Toggle sign up / login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
              }}
              className="text-cyan-400/70 text-sm font-mono hover:text-cyan-300 transition-colors"
            >
              {isSignUp ? "Já tem conta? ENTRAR" : "Não tem conta? CADASTRAR"}
            </button>
          </div>

          {/* Decorative bottom line */}
          <div className="mt-8 flex items-center gap-2 justify-center">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-cyan-400/50" />
            <div className="w-2 h-2 bg-cyan-400/50 rotate-45" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-cyan-400/50" />
          </div>
        </div>
      </div>
    </div>
  )
}
