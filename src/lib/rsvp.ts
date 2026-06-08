import type { RSVPPayload } from '../types/guest'

export async function submitRSVP(payload: RSVPPayload): Promise<void> {
  const endpoint = import.meta.env.VITE_RSVP_ENDPOINT
  if (!endpoint) throw new Error('VITE_RSVP_ENDPOINT is not set')

  // text/plain avoids CORS preflight — Apps Script doesn't handle OPTIONS well
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
    redirect: 'follow',
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const data = await res.json()
  if (!data.success) throw new Error(data.error ?? 'unknown_error')
}
