"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { motion } from "framer-motion"
import { BackgroundPaths } from "@/components/ui/background-paths"
import { C } from "@/components/terminal/design-system"

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay }}>
      {children}
    </motion.div>
  )
}

function CornerMarks() {
  const corners = ["top-5 left-5 border-t border-l","top-5 right-5 border-t border-r","bottom-5 left-5 border-b border-l","bottom-5 right-5 border-b border-r"]
  return <>{corners.map((c, i) => <span key={i} className={`absolute w-4 h-4 opacity-30 pointer-events-none ${c}`} style={{ borderColor: C.dim }} />)}</>
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [validSession, setValidSession] = useState(false)

  useEffect(() => {
    // Supabase puts the session in the URL hash after the reset link is clicked
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true)
      else router.push("/auth")
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError("Passwords don't match"); return }
    setError(null); setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
      setTimeout(() => router.push("/terminal"), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update password")
    } finally { setLoading(false) }
  }

  if (!validSession) return null

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden" style={{ background: C.bg }}>
      <BackgroundPaths />
      <CornerMarks />
      <div className="absolute top-1/2 left-0 right-0 h-px opacity-20 pointer-events-none" style={{ background: C.border }} />

      <div className="relative z-10 flex flex-col items-center w-full px-6">
        <Reveal delay={0.1}>
          <p className="font-mono text-[9px] tracking-[0.35em] uppercase mb-8 text-center" style={{ color: C.muted }}>v2.1 &nbsp;·&nbsp; systematic research</p>
        </Reveal>
        <Reveal delay={0.2}>
          <h1 className="font-serif text-5xl font-extrabold tracking-tight mb-1 text-center" style={{ color: C.bright }}>AlphaForge</h1>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="w-10 h-px mx-auto my-7" style={{ background: C.dim }} />
        </Reveal>

        <Reveal delay={0.45} className="w-full max-w-sm">
          <div className="border p-8" style={{ background: C.surface, borderColor: C.border }}>
            {done ? (
              <div className="text-center">
                <p className="font-mono text-[9px] tracking-[0.25em] uppercase mb-4" style={{ color: C.muted }}>Password updated</p>
                <p className="font-mono text-[11px] leading-relaxed" style={{ color: C.text }}>
                  Your password has been reset. Redirecting to terminal...
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="font-mono text-[9px] tracking-[0.25em] uppercase mb-1" style={{ color: C.muted }}>New password</p>
                  <p className="font-mono text-[10px] leading-relaxed" style={{ color: C.subtle }}>Choose a new password for your account.</p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <p className="font-mono text-[9px] tracking-[0.25em] uppercase mb-2" style={{ color: C.muted }}>Password</p>
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6}
                      className="w-full font-mono text-[11px] border px-3 py-2.5 outline-none transition-colors duration-150 placeholder:opacity-30"
                      style={{ background: C.bg, color: C.text, borderColor: C.dim }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = C.text)}
                      onBlur={(e) => (e.currentTarget.style.borderColor = C.dim)} />
                  </div>
                  <div>
                    <p className="font-mono text-[9px] tracking-[0.25em] uppercase mb-2" style={{ color: C.muted }}>Confirm password</p>
                    <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" minLength={6}
                      className="w-full font-mono text-[11px] border px-3 py-2.5 outline-none transition-colors duration-150 placeholder:opacity-30"
                      style={{ background: C.bg, color: C.text, borderColor: C.dim }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = C.text)}
                      onBlur={(e) => (e.currentTarget.style.borderColor = C.dim)} />
                  </div>
                  {error && <div className="font-mono text-[10px] border px-3 py-2" style={{ color: C.neg, borderColor: C.neg, background: C.negDim }}>{error}</div>}
                  <button type="submit" disabled={loading}
                    className="font-mono text-[9px] tracking-[0.25em] uppercase border px-3 py-2.5 mt-2 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: C.text, color: C.bg, borderColor: C.text }}
                    onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = C.bright; e.currentTarget.style.borderColor = C.bright }}}
                    onMouseLeave={(e) => { e.currentTarget.style.background = C.text; e.currentTarget.style.borderColor = C.text }}>
                    {loading ? "···" : "Update Password"}
                  </button>
                </form>
              </>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.6}>
          <p className="font-mono text-[8px] tracking-[0.2em] uppercase mt-8" style={{ color: C.muted }}>Systematic Strategy Research Terminal</p>
        </Reveal>
      </div>
    </div>
  )
}
