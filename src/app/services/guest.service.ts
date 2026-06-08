import { Injectable, computed, signal } from '@angular/core'
import { environment } from '../../environments/environment'
import type { Guest } from '../types/guest'

const CODE_RE = /^[a-z2-9]{4,8}$/i

@Injectable({ providedIn: 'root' })
export class GuestService {
  private readonly _guest = signal<Guest | null>(null)
  private readonly _loading = signal(false)
  private _code: string | null = null

  readonly guest = this._guest.asReadonly()
  readonly loading = this._loading.asReadonly()
  readonly hasPersonalization = computed(() => this._guest() !== null)
  readonly displayName = computed(() => this._guest()?.name ?? 'Дорогі гості')
  get code(): string | null { return this._code }

  async init(): Promise<void> {
    const code = this.getCodeFromURL()
    this._code = code
    if (!code) return

    this._loading.set(true)
    try {
      const guest = await this.fetchGuest(code)
      console.log(guest);
      if (guest) this._guest.set(guest)
    } finally {
      this._loading.set(false)
    }
  }

  private getCodeFromURL(): string | null {
    const fromPath = window.location.pathname.replace(/^\//, '').toLowerCase().trim()
    if (CODE_RE.test(fromPath)) {
      localStorage.setItem('guest_code', fromPath)
      return fromPath
    }

    const fromQuery = new URLSearchParams(window.location.search).get('code')?.toLowerCase().trim() ?? ''
    if (CODE_RE.test(fromQuery)) {
      localStorage.setItem('guest_code', fromQuery)
      return fromQuery
    }

    const fromStorage = localStorage.getItem('guest_code')?.toLowerCase().trim() ?? ''
    if (CODE_RE.test(fromStorage)) return fromStorage

    return null
  }

  private async fetchGuest(code: string): Promise<Guest | null> {
    const endpoint = environment.rsvpEndpoint
    if (!endpoint) return null
    try {
      console.log(endpoint, encodeURIComponent(code));
      const res = await fetch(`${endpoint}?code=${encodeURIComponent(code)}`, {
        redirect: 'follow',
      })
      if (!res.ok) return null
      const data = await res.json()
      return data.found && data.guest ? (data.guest as Guest) : null
    } catch (err) {
      console.error('[guest]', err)
      return null
    }
  }
}
