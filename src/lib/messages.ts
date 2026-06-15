import { supabase } from './supabase'

export interface Message {
  id: string
  created_at: string
  name: string | null
  email: string | null
  message: string | null
  status: string
}

/** Public: submit a contact message (also fires an email notification). */
export async function sendMessage(name: string, email: string, message: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('lumia_messages').insert({ name, email, message })
  if (error) return { error: error.message }
  // Best-effort email notification to the shop inbox (don't block on failure)
  fetch('/.netlify/functions/contact-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message }),
  }).catch(() => {})
  return { error: null }
}

export async function adminListMessages(): Promise<Message[]> {
  const { data, error } = await supabase.from('lumia_messages').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Message[]
}

export async function adminUpdateMessage(id: string, status: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('lumia_messages').update({ status }).eq('id', id)
  return { error: error?.message ?? null }
}
