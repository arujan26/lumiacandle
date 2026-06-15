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

/** True when MFA is either satisfied (aal2) or not required for this user. */
export async function isAalSatisfied(): Promise<boolean> {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (error || !data) return true // fail open to not lock out if MFA unavailable
  // If the user must step up to aal2 but is only aal1, MFA is pending.
  if (data.nextLevel === 'aal2' && data.currentLevel !== 'aal2') return false
  return true
}

/** Does this user already have a verified TOTP factor? Returns the factor id or null. */
export async function getVerifiedTotpFactorId(): Promise<string | null> {
  const { data, error } = await supabase.auth.mfa.listFactors()
  if (error || !data) return null
  const f = data.totp?.find(t => t.status === 'verified')
  return f?.id ?? null
}

/** Auth + admin + MFA state for guarding the dashboard. */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [aalOk, setAalOk] = useState(false)
  const [hasFactor, setHasFactor] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const evaluate = async (s: Session | null) => {
      if (!active) return
      setSession(s)
      if (s) {
        setIsAdmin(await checkIsAdmin())
        setAalOk(await isAalSatisfied())
        setHasFactor(!!(await getVerifiedTotpFactorId()))
      } else {
        setIsAdmin(false); setAalOk(false); setHasFactor(false)
      }
      setLoading(false)
    }
    supabase.auth.getSession().then(({ data }) => evaluate(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => evaluate(s))
    return () => { active = false; sub.subscription.unsubscribe() }
  }, [])

  // Dashboard access requires: admin + an enrolled TOTP factor + completed aal2.
  const allowed = !!session && isAdmin && hasFactor && aalOk
  return { session, isAdmin, aalOk, hasFactor, allowed, loading }
}
