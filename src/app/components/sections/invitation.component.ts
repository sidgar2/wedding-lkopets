import { Component, OnDestroy, OnInit, signal } from '@angular/core'
import { AnimViewDirective } from '../../directives/anim-view.directive'
import { CardComponent } from '../ui/card.component'
import { STAGGER_FADE } from '../../animations'

interface Countdown { days: number; hours: number; minutes: number; seconds: number }

@Component({
  selector: 'app-invitation',
  standalone: true,
  imports: [AnimViewDirective, CardComponent],
  animations: [STAGGER_FADE],
  templateUrl: './invitation.component.html',
})
export class InvitationComponent implements OnInit, OnDestroy {
  readonly calendarWeeks: (number | null)[][] = [
    [null, null, null, null, null, 1,  2 ],
    [3,    4,    5,    6,    7,    8,  9 ],
    [10,   11,   12,   13,   14,   15, 16],
    [17,   18,   19,   20,   21,   22, 23],
    [24,   25,   26,   27,   28,   29, 30],
    [31,   null, null, null, null, null, null],
  ]

  readonly countdown = signal<Countdown>(this.compute())

  private timer!: ReturnType<typeof setInterval>

  ngOnInit(): void {
    this.timer = setInterval(() => this.countdown.set(this.compute()), 1000)
  }

  ngOnDestroy(): void {
    clearInterval(this.timer)
  }

  private compute(): Countdown {
    const diff = Math.max(0, new Date(2026, 7, 28, 12, 0, 0).getTime() - Date.now())
    const totalSeconds = Math.floor(diff / 1000)
    return {
      days:    Math.floor(totalSeconds / 86400),
      hours:   Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    }
  }
}
