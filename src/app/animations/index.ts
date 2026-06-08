import {
  trigger, transition, style, animate, query, stagger, state,
} from '@angular/animations'

const EASE = '600ms cubic-bezier(0.4, 0, 0.2, 1)'

// Card-level fade+slide — used on each section wrapper
export const FADE_IN_UP = trigger('fadeInUp', [
  transition('hidden => visible', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate(EASE, style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
])

// Staggered children — parent carries trigger, children have class "anim"
export const STAGGER_FADE = trigger('staggerFade', [
  transition('hidden => visible', [
    query('.anim', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      stagger('80ms', animate(EASE, style({ opacity: 1, transform: 'translateY(0)' }))),
    ], { optional: true }),
  ]),
])

// RSVP form ↔ success swap
export const FORM_SWAP = trigger('formSwap', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(10px)' }),
    animate('400ms 80ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
  transition(':leave', [
    animate('250ms ease-in', style({ opacity: 0, transform: 'translateY(-8px)' })),
  ]),
])

// Error message fade in/out
export const ERROR_FADE = trigger('errorFade', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(-4px)' }),
    animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
  transition(':leave', [
    animate('150ms ease-in', style({ opacity: 0 })),
  ]),
])
