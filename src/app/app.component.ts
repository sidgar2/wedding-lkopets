import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core'
import { GuestService } from './services/guest.service'
import { HeroComponent } from './components/sections/hero.component'
import { InvitationComponent } from './components/sections/invitation.component'
import { VenueComponent } from './components/sections/venue.component'
import { ProgramComponent } from './components/sections/program.component'
import { DressCodeComponent } from './components/sections/dress-code.component'
import { WishesComponent } from './components/sections/wishes.component'
import { RsvpSectionComponent } from './components/sections/rsvp-section.component'
import { MusicPlayerComponent } from './components/ui/music-player.component'

const FULL_TEXT = 'Все\nпочинається\nз любові'
const CHAR_DELAY = 70

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeroComponent,
    InvitationComponent,
    VenueComponent,
    ProgramComponent,
    DressCodeComponent,
    WishesComponent,
    RsvpSectionComponent,
    MusicPlayerComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  private guestService = inject(GuestService)

  readonly locked = signal(true)
  readonly typedHtml = signal('')
  readonly typedLines = computed(() => this.typedHtml().split('<br/>'))
  readonly showHeart = signal(false)
  readonly showSubtext = signal(false)

  readonly LINES = FULL_TEXT.split('\n')

  ngOnInit(): void {
    this.guestService.init()
    document.body.style.overflow = 'hidden'
    this.runTypewriter()
  }

  ngOnDestroy(): void {
    document.body.style.overflow = ''
  }

  unlock(): void {
    this.locked.set(false)
    document.body.style.overflow = ''
  }

  private runTypewriter(): void {
    let i = 0
    const tick = () => {
      if (i <= FULL_TEXT.length) {
        this.typedHtml.set(FULL_TEXT.slice(0, i).replace(/\n/g, '<br/>'))
        i++
        setTimeout(tick, CHAR_DELAY)
      } else {
        setTimeout(() => {
          this.showHeart.set(true)
          setTimeout(() => this.showSubtext.set(true), 600)
        }, 300)
      }
    }
    setTimeout(tick, 400)
  }
}
