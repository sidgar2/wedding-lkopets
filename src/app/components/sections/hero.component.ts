import { Component, inject } from '@angular/core'
import { trigger, transition, animate, style } from '@angular/animations'
import { GuestService } from '../../services/guest.service'

@Component({
  selector: 'app-hero',
  standalone: true,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        animate('800ms 200ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
  templateUrl: './hero.component.html',
})
export class HeroComponent {
  readonly guestService = inject(GuestService)
}
