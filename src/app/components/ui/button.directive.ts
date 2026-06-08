import { Directive, HostBinding, input } from '@angular/core'

@Directive({
  selector: 'a[appButton], button[appButton]',
  standalone: true,
})
export class ButtonDirective {
  readonly variant = input<'primary' | 'ghost'>('primary')

  @HostBinding('class')
  get classes(): string {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mocha/40 disabled:opacity-50 disabled:pointer-events-none'
    const variants = {
      primary: 'bg-mocha text-cream hover:bg-mocha/90 active:scale-95',
      ghost: 'border border-mocha/30 text-mocha hover:bg-muted/5 active:scale-95',
    }
    return `${base} ${variants[this.variant()]}`
  }
}
