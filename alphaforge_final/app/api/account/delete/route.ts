import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// Permanently deletes the signed-in user's account and all their data.
// Runs on the server so it can use the service-role key (never exposed to the client).
export async function POST() {
  const cookieStore = cookies()

  // 1. Identify the caller from their session cookie — never trust an id from the body.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore — nothing to set when only reading the user.
          }
        },
      },
    }
  )

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json(
      { error: "Account deletion is not configured on the server." },
      { status: 500 }
    )
  }

  // 2. Admin client (service role) — bypasses RLS so it can remove the user's rows.
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const userId = user.id

  // 3. Remove user-owned data first (best-effort — tables may legitimately be empty).
  await admin.from("saved_backtests").delete().eq("user_id", userId)
  await admin.from("watchlist").delete().eq("user_id", userId)
  await admin.from("profiles").delete().eq("id", userId)

  // 4. Delete the auth user itself.
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  // 5. Clear the session cookies server-side.
  await supabase.auth.signOut()

  return NextResponse.json({ ok: true })
}
