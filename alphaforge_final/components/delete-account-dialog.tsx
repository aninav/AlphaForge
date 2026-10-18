"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "@/lib/auth"
import { C } from "@/components/terminal/design-system"

interface DeleteAccountDialogProps {
  open: boolean
  onClose: () => void
}

export function DeleteAccountDialog({ open, onClose }: DeleteAccountDialogProps) {
  const router = useRouter()
  const [confirmText, setConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset state each time the dialog is opened.
  useEffect(() => {
    if (open) {
      setConfirmText("")
      setError(null)
      setDeleting(false)
    }
  }, [open])

  if (!open) return null

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch("/api/account/delete", { method: "POST" })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Could not delete your account.")
      }
      await signOut()
      router.push("/")
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
      setDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={() => !deleting && onClose()}
    >
      <div
        className="w-full max-w-md border p-6"
        style={{ background: C.surface, borderColor: C.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: C.neg }}>
          Delete account
        </p>
        <p className="mb-1 font-mono text-[11px] leading-relaxed" style={{ color: C.text }}>
          This permanently deletes your account and all saved backtests and watchlists.
        </p>
        <p className="mb-4 font-mono text-[10px] leading-relaxed" style={{ color: C.subtle }}>
          This cannot be undone.
        </p>

        <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: C.muted }}>
          Type <span style={{ color: C.text }}>DELETE</span> to confirm
        </p>
        <input
          autoFocus
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          disabled={deleting}
          className="mb-4 w-full border px-3 py-2 font-mono text-[12px] tracking-[0.2em] outline-none"
          style={{ background: C.bg, color: C.text, borderColor: C.dim }}
        />

        {error && (
          <div
            className="mb-4 border px-3 py-2 font-mono text-[10px]"
            style={{ color: C.neg, borderColor: C.neg, background: C.negDim }}
          >
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.2em] transition-colors disabled:opacity-40"
            style={{ color: C.body, borderColor: C.dim, background: "transparent" }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting || confirmText !== "DELETE"}
            className="border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.2em] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            style={{ color: C.bg, borderColor: C.neg, background: C.neg }}
          >
            {deleting ? "Deleting…" : "Delete forever"}
          </button>
        </div>
      </div>
    </div>
  )
}
