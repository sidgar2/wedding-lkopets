export interface Guest {
  code: string
  name: string
  side: 'bride' | 'groom'
}

export interface RSVPPayload {
  guestCode: string
  name: string
  guestsCount: number
  attendance: 'yes' | 'no' | 'maybe'
  comment?: string
}

export type RSVPState = 'idle' | 'submitting' | 'success' | 'error'
