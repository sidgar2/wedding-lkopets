import { environment } from '../../environments/environment'
import type { RSVPPayload } from '../types/guest'

export async function submitRSVP(payload: RSVPPayload): Promise<void> {
  const endpoint = environment.rsvpEndpoint
  if (!endpoint) throw new Error('rsvpEndpoint is not set in environment.ts')

  const res = await fetch(endpoint, {
    method: 'POST',
    // text/plain avoids CORS preflight — Apps Script doesn't handle OPTIONS well
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
    redirect: 'follow',
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (!data.success) throw new Error(data.error ?? 'unknown_error')
}
