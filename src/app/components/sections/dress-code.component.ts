import { Component } from '@angular/core'
import { AnimViewDirective } from '../../directives/anim-view.directive'
import { CardComponent } from '../ui/card.component'
import { SectionTitleComponent } from '../ui/section-title.component'
import { STAGGER_FADE } from '../../animations'

const ROWS: string[][] = [
  ['dress-1.png', 'dress-2.png', 'dress-3.png', 'dress-4.png', 'dress-5.png'],
  ['dress-6.png', 'dress-7.png', 'dress-8.png', 'dress-9.png', 'dress-10.png'],
]

@Component({
  selector: 'app-dress-code',
  standalone: true,
  imports: [AnimViewDirective, CardComponent, SectionTitleComponent],
  animations: [STAGGER_FADE],
  templateUrl: './dress-code.component.html',
})
export class DressCodeComponent {
  readonly rows = ROWS
}
