import { Component } from '@angular/core'
import { AnimViewDirective } from '../../directives/anim-view.directive'
import { CardComponent } from '../ui/card.component'
import { STAGGER_FADE } from '../../animations'

@Component({
  selector: 'app-farewell',
  standalone: true,
  imports: [AnimViewDirective, CardComponent],
  animations: [STAGGER_FADE],
  templateUrl: './farewell.component.html',
})
export class FarewellComponent {}
