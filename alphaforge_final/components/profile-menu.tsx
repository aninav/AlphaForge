"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { signOut } from "@/lib/auth"
import { DeleteAccountDialog } from "@/components/delete-account-dialog"
import { ChevronDown, LogOut, Trash2, LayoutGrid, Home, UserRound } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { C } from "@/components/terminal/design-system"

interface ProfileMenuProps {
  /** Which page it sits on — decides the primary navigation shortcut shown. */
  context?: "landing" | "terminal"
}

export function ProfileMenu({ context = "landing" }: ProfileMenuProps) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [showDelete, setShowDelete] = useState(false)

  if (loading || !user) return null

  const email = user.email ?? "Account"
  const initial = email.charAt(0).toUpperCase()

  async function handleSignOut() {
    await signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="inline-flex items-center gap-2 border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors"
            style={{ borderColor: C.dim, color: C.body, background: "transparent" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.accent)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.dim)}
            aria-label="Account menu"
          >
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium"
              style={{ background: C.panel, color: C.bright, border: `1px solid ${C.dim}` }}
            >
              {initial}
            </span>
            <span className="hidden max-w-[150px] truncate md:inline" style={{ color: C.body }}>
              {email}
            </span>
            <ChevronDown size={12} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="min-w-[220px]"
          style={{ background: C.panel, borderColor: C.border, color: C.body }}
        >
          <DropdownMenuLabel className="font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: C.muted }}>
            <div className="flex items-center gap-2">
              <UserRound size={12} />
              <span className="truncate" style={{ color: C.text }}>{email}</span>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator style={{ background: C.border }} />

          <DropdownMenuItem
            onClick={() => router.push("/profile")}
            className="cursor-pointer font-mono text-[11px] tracking-wide focus:bg-transparent"
            style={{ color: C.body }}
          >
            <UserRound size={13} className="mr-2" />
            Profile
          </DropdownMenuItem>

          {context === "landing" ? (
            <DropdownMenuItem
              onClick={() => router.push("/terminal")}
              className="cursor-pointer font-mono text-[11px] tracking-wide focus:bg-transparent"
              style={{ color: C.body }}
            >
              <LayoutGrid size={13} className="mr-2" />
              Open terminal
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => router.push("/")}
              className="cursor-pointer font-mono text-[11px] tracking-wide focus:bg-transparent"
              style={{ color: C.body }}
            >
              <Home size={13} className="mr-2" />
              Back to landing
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={handleSignOut}
            className="cursor-pointer font-mono text-[11px] tracking-wide focus:bg-transparent"
            style={{ color: C.body }}
          >
            <LogOut size={13} className="mr-2" />
            Log out
          </DropdownMenuItem>

          <DropdownMenuSeparator style={{ background: C.border }} />

          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              setShowDelete(true)
            }}
            className="cursor-pointer font-mono text-[11px] tracking-wide focus:bg-transparent"
            style={{ color: C.neg }}
          >
            <Trash2 size={13} className="mr-2" />
            Delete account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteAccountDialog open={showDelete} onClose={() => setShowDelete(false)} />
    </>
  )
}
