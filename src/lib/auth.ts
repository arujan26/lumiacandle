import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

export async function signIn(email: string, password: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  return { error: error?.message ?? null }
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function checkIsAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('lumia_is_admin')
  if (error) return false
  return data === true
}

/** Auth + admin state for guarding the dashboard. */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      setIsAdmin(data.session ? await checkIsAdmin() : false)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      if (!active) return
      setSession(s)
      setIsAdmin(s ? await checkIsAdmin() : false)
    })
    return () => { active = false; sub.subscription.unsubscribe() }
  }, [])

  return { session, isAdmin, loading }
}
