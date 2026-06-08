export interface Guest {
  code: string
  name: string
  multiTrack: boolean
}

export interface RSVPPayload {
  name: string
  attendance: 'yes' | 'no' | 'maybe'
  guestCount: number
  wishes?: string
  guestCode?: string
}

export type RSVPState = 'idle' | 'submitting' | 'success' | 'error'
