"use client"

import { useAuth } from "@/components/auth-provider"
import { signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export function UserMenu() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading || !user) return null

  async function handleSignOut() {
    await signOut()
    router.push("/auth")
    router.refresh()
  }

  return (
    <div className="flex items-center justify-between px-3 py-2 border-t border-forge-border mt-auto">
      <div className="min-w-0">
        <p className="text-forge-cyan text-xs font-mono truncate">{user.email}</p>
        <p className="text-forge-muted text-[10px] font-mono">authenticated</p>
      </div>
      <button
        onClick={handleSignOut}
        title="Sign out"
        className="text-forge-muted hover:text-red-400 transition-colors ml-2 flex-shrink-0"
      >
        <LogOut size={14} />
      </button>
    </div>
  )
}
