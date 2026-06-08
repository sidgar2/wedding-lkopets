import type { Guest } from '../types/guest'

const CODE_REGEX = /^[a-z2-9]{4,8}$/i

export function getCodeFromURL(): string | null {
  const params = new URLSearchParams(window.location.search)
  const raw = params.get('guest')
  if (!raw) return null
  const code = raw.toLowerCase().trim()
  if (!CODE_REGEX.test(code)) return null
  return code
}

export async function fetchGuest(code: string): Promise<Guest | null> {
  const endpoint = import.meta.env.VITE_RSVP_ENDPOINT
  if (!endpoint) {
    console.warn('[guest] VITE_RSVP_ENDPOINT not set')
    return null
  }
  try {
    const res = await fetch(`${endpoint}?code=${encodeURIComponent(code)}`, {
      redirect: 'follow',
    })
    if (!res.ok) {
      console.error('[guest] lookup failed:', res.status)
      return null
    }
    const data = await res.json()
    if (data.found && data.guest) return data.guest as Guest
    return null
  } catch (err) {
    console.error('[guest] network error:', err)
    return null
  }
}
