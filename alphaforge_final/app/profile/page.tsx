"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, LogOut, Trash2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { signOut } from "@/lib/auth"
import { createClient } from "@/lib/supabase"
import { DeleteAccountDialog } from "@/components/delete-account-dialog"
import { Theme } from "@/components/ui/theme"
import { C } from "@/components/terminal/design-system"
import { formatDateLabel } from "@/lib/date"

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t py-3" style={{ borderColor: C.border }}>
      <span className="font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: C.muted }}>
        {label}
      </span>
      <span className="truncate font-mono text-[11px]" style={{ color: C.text }}>
        {value}
      </span>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border p-4" style={{ background: C.surface, borderColor: C.border }}>
      <p className="mb-2 font-mono text-[8px] uppercase tracking-[0.22em]" style={{ color: C.muted }}>
        {label}
      </p>
      <p className="font-mono text-2xl font-medium" style={{ color: C.bright }}>
        {value}
      </p>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [showDelete, setShowDelete] = useState(false)
  const [savedCount, setSavedCount] = useState<number | null>(null)
  const [watchCount, setWatchCount] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    Promise.all([
      supabase.from("saved_backtests").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("watchlist").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    ]).then(([saved, watch]) => {
      setSavedCount(saved.count ?? 0)
      setWatchCount(watch.count ?? 0)
    })
  }, [user])

  async function handleSignOut() {
    await signOut()
    router.push("/")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: C.bg }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: C.muted }}>
          Loading…
        </p>
      </div>
    )
  }

  if (!user) return null // middleware redirects unauthenticated users

  const provider = (user.app_metadata?.provider as string | undefined) ?? "email"
  const email = user.email ?? "—"
  const initial = email.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.text }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: C.border, background: C.surface }}>
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-serif text-xl font-bold tracking-tight" style={{ color: C.bright }}>
            AlphaForge
          </Link>
          <div className="flex items-center gap-3">
            <Theme variant="dropdown" size="sm" />
            <Link
              href="/terminal"
              className="inline-flex items-center gap-2 border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-opacity hover:opacity-90"
              style={{ borderColor: C.accent, background: C.accent, color: C.bg }}
            >
              Enter Terminal
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Identity */}
        <div className="mb-10 flex items-center gap-4">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full font-mono text-xl font-medium"
            style={{ background: C.panel, color: C.bright, border: `1px solid ${C.dim}` }}
          >
            {initial}
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: C.muted }}>
              Account
            </p>
            <h1 className="truncate font-mono text-xl" style={{ color: C.bright }}>
              {email}
            </h1>
          </div>
        </div>

        {/* Usage stats */}
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Saved backtests" value={savedCount === null ? "…" : String(savedCount)} />
          <StatCard label="Watchlist tickers" value={watchCount === null ? "…" : String(watchCount)} />
          <StatCard label="Signed in with" value={provider === "google" ? "Google" : "Email"} />
        </div>

        {/* Account details */}
        <section className="mb-10 border p-5" style={{ background: C.surface, borderColor: C.border }}>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: C.bright }}>
            Account details
          </p>
          <Field label="Email" value={email} />
          <Field label="Member since" value={user.created_at ? formatDateLabel(user.created_at) : "—"} />
          <Field
            label="Last sign in"
            value={user.last_sign_in_at ? formatDateLabel(user.last_sign_in_at) : "—"}
          />
          <Field label="User ID" value={user.id} />
        </section>

        {/* Account actions */}
        <section className="border p-5" style={{ background: C.surface, borderColor: C.neg }}>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: C.neg }}>
            Account actions
          </p>
          <p className="mb-5 font-mono text-[10px] leading-relaxed" style={{ color: C.subtle }}>
            Log out of this device, or permanently delete your account and all associated data.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-2 border px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.2em] transition-colors"
              style={{ color: C.body, borderColor: C.dim, background: "transparent" }}
            >
              <LogOut size={13} />
              Log out
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="inline-flex items-center justify-center gap-2 border px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.2em] transition-colors"
              style={{ color: C.bg, borderColor: C.neg, background: C.neg }}
            >
              <Trash2 size={13} />
              Delete account
            </button>
          </div>
        </section>
      </main>

      <DeleteAccountDialog open={showDelete} onClose={() => setShowDelete(false)} />
    </div>
  )
}
