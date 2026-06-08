import { Component } from '@angular/core'
import { AnimViewDirective } from '../../directives/anim-view.directive'
import { CardComponent } from '../ui/card.component'
import { SectionTitleComponent } from '../ui/section-title.component'
import { ButtonDirective } from '../ui/button.directive'
import { STAGGER_FADE } from '../../animations'

@Component({
  selector: 'app-venue',
  standalone: true,
  imports: [AnimViewDirective, CardComponent, SectionTitleComponent, ButtonDirective],
  animations: [STAGGER_FADE],
  templateUrl: './venue.component.html',
})
export class VenueComponent {}
