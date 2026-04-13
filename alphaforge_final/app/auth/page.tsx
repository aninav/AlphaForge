"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmail, signUpWithEmail, resetPassword } from "@/lib/auth"
import { useAuth } from "@/components/auth-provider"
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

function ForgeInput({ label, type, value, onChange, placeholder, minLength }: { label: string; type: string; value: string; onChange: (v: string) => void; placeholder: string; minLength?: number }) {
  return (
    <div>
      <p className="font-mono text-[9px] tracking-[0.25em] uppercase mb-2" style={{ color: C.muted }}>{label}</p>
      <input type={type} required value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} minLength={minLength}
        className="w-full font-mono text-[11px] border px-3 py-2.5 outline-none transition-colors duration-150 placeholder:opacity-30"
        style={{ background: C.bg, color: C.text, borderColor: C.dim }}
        onFocus={(e) => (e.currentTarget.style.borderColor = C.text)}
        onBlur={(e) => (e.currentTarget.style.borderColor = C.dim)}
      />
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

type Mode = "signin" | "signup" | "forgot"

export default function AuthPage() {
  const router = useRouter()
  const { signInWithGoogle } = useAuth()
  const [mode, setMode] = useState<Mode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [confirmSent, setConfirmSent] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  function switchMode(m: Mode) { setMode(m); setError(null); setConfirmSent(false); setResetSent(false) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null); setLoading(true)
    try {
      if (mode === "signin") { await signInWithEmail(email, password); router.push("/terminal"); router.refresh() }
      else if (mode === "signup") { await signUpWithEmail(email, password); setConfirmSent(true) }
      else { await resetPassword(email); setResetSent(true) }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed")
    } finally { setLoading(false) }
  }

  async function handleGoogle() {
    setError(null)
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
      // Supabase will redirect — no need to push manually
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed")
      setGoogleLoading(false)
    }
  }

  const showConfirm = confirmSent || resetSent

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
            {showConfirm ? (
              <div className="text-center">
                <p className="font-mono text-[9px] tracking-[0.25em] uppercase mb-4" style={{ color: C.muted }}>
                  {confirmSent ? "Confirm your email" : "Check your inbox"}
                </p>
                <p className="font-mono text-[11px] leading-relaxed mb-6" style={{ color: C.text }}>
                  {confirmSent ? "A verification link has been sent to " : "A password reset link has been sent to "}
                  <span style={{ color: C.bright }}>{email}</span>.
                  <br />
                  {confirmSent ? "Check your inbox to activate your account." : "Follow the link to reset your password."}
                </p>
                <button onClick={() => switchMode("signin")} className="font-mono text-[9px] tracking-[0.2em] uppercase transition-colors" style={{ color: C.mid }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.text)} onMouseLeave={(e) => (e.currentTarget.style.color = C.mid)}>
                  ← Back to sign in
                </button>
              </div>
            ) : mode === "forgot" ? (
              <>
                <div className="mb-6">
                  <p className="font-mono text-[9px] tracking-[0.25em] uppercase mb-1" style={{ color: C.muted }}>Reset password</p>
                  <p className="font-mono text-[10px] leading-relaxed" style={{ color: C.subtle }}>Enter your email and we'll send a reset link.</p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <ForgeInput label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
                  {error && <div className="font-mono text-[10px] border px-3 py-2" style={{ color: C.neg, borderColor: C.neg, background: C.negDim }}>{error}</div>}
                  <button type="submit" disabled={loading}
                    className="font-mono text-[9px] tracking-[0.25em] uppercase border px-3 py-2.5 mt-2 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: C.text, color: C.bg, borderColor: C.text }}
                    onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = C.bright; e.currentTarget.style.borderColor = C.bright }}}
                    onMouseLeave={(e) => { e.currentTarget.style.background = C.text; e.currentTarget.style.borderColor = C.text }}>
                    {loading ? "···" : "Send Reset Link"}
                  </button>
                  <button type="button" onClick={() => switchMode("signin")} className="font-mono text-[9px] tracking-[0.2em] uppercase transition-colors text-center" style={{ color: C.mid }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = C.text)} onMouseLeave={(e) => (e.currentTarget.style.color = C.mid)}>
                    ← Back to sign in
                  </button>
                </form>
              </>
            ) : (
              <>
                {/* Sign in / Sign up tabs */}
                <div className="flex mb-6 border" style={{ borderColor: C.dim }}>
                  {(["signin", "signup"] as const).map((m) => (
                    <button key={m} onClick={() => switchMode(m)} className="flex-1 py-2 font-mono text-[9px] tracking-[0.25em] uppercase transition-colors duration-150"
                      style={{ background: mode === m ? C.text : "transparent", color: mode === m ? C.bg : C.mid, borderRight: m === "signin" ? `1px solid ${C.dim}` : undefined }}>
                      {m === "signin" ? "Sign In" : "Sign Up"}
                    </button>
                  ))}
                </div>

                {/* Google OAuth button */}
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-2.5 font-mono text-[9px] tracking-[0.2em] uppercase border px-3 py-2.5 mb-5 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "transparent", color: C.text, borderColor: C.dim }}
                  onMouseEnter={(e) => { if (!googleLoading) e.currentTarget.style.borderColor = C.text }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.dim }}
                >
                  {googleLoading ? "···" : <><GoogleIcon />Continue with Google</>}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px" style={{ background: C.dim }} />
                  <span className="font-mono text-[8px] tracking-[0.2em] uppercase" style={{ color: C.muted }}>or</span>
                  <div className="flex-1 h-px" style={{ background: C.dim }} />
                </div>

                {/* Email / password form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <ForgeInput label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
                  <ForgeInput label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" minLength={6} />
                  {error && <div className="font-mono text-[10px] border px-3 py-2" style={{ color: C.neg, borderColor: C.neg, background: C.negDim }}>{error}</div>}
                  <button type="submit" disabled={loading}
                    className="font-mono text-[9px] tracking-[0.25em] uppercase border px-3 py-2.5 mt-2 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: C.text, color: C.bg, borderColor: C.text }}
                    onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = C.bright; e.currentTarget.style.borderColor = C.bright }}}
                    onMouseLeave={(e) => { e.currentTarget.style.background = C.text; e.currentTarget.style.borderColor = C.text }}>
                    {loading ? "···" : mode === "signin" ? "Enter Terminal" : "Create Account"}
                  </button>
                  {mode === "signin" && (
                    <button type="button" onClick={() => switchMode("forgot")} className="font-mono text-[9px] tracking-[0.2em] uppercase transition-colors text-center" style={{ color: C.mid }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = C.text)} onMouseLeave={(e) => (e.currentTarget.style.color = C.mid)}>
                      Forgot password?
                    </button>
                  )}
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
