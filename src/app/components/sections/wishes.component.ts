import { Component, signal } from '@angular/core'
import { AnimViewDirective } from '../../directives/anim-view.directive'
import { CardComponent } from '../ui/card.component'
import { SectionTitleComponent } from '../ui/section-title.component'
import { STAGGER_FADE } from '../../animations'

@Component({
  selector: 'app-wishes',
  standalone: true,
  imports: [AnimViewDirective, CardComponent, SectionTitleComponent],
  animations: [STAGGER_FADE],
  templateUrl: './wishes.component.html',
})
export class WishesComponent {
  readonly open = signal(false)
}
