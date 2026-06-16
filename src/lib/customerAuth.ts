import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

export async function customerSignUp(name: string, email: string, password: string): Promise<{ error: string | null; needsConfirm: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { name: name.trim() }, emailRedirectTo: `${window.location.origin}/account` },
  })
  if (error) return { error: error.message, needsConfirm: false }
  return { error: null, needsConfirm: !data.session }
}

export async function customerSignIn(email: string, password: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  return { error: error?.message ?? null }
}

export async function customerSignOut() {
  await supabase.auth.signOut()
}

/** Plain auth session for storefront customers (no admin/2FA gating). */
export function useCustomer() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setLoading(false) } })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { if (active) setSession(s) })
    return () => { active = false; sub.subscription.unsubscribe() }
  }, [])
  return { session, loading }
}

export const customerName = (s: Session | null) => (s?.user?.user_metadata?.name as string) || s?.user?.email?.split('@')[0] || 'there'
