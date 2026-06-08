import {
  AfterViewInit, Directive, ElementRef, OnDestroy, inject, signal,
} from '@angular/core'

@Directive({
  selector: '[animView]',
  standalone: true,
  exportAs: 'v',
})
export class AnimViewDirective implements AfterViewInit, OnDestroy {
  readonly state = signal<'hidden' | 'visible'>('hidden')

  private el = inject(ElementRef)
  private observer?: IntersectionObserver

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.state.set('visible')
          this.observer?.disconnect()
        }
      },
      { rootMargin: '-30px', threshold: 0.05 },
    )
    this.observer.observe(this.el.nativeElement)
  }

  ngOnDestroy(): void {
    this.observer?.disconnect()
  }
}
