import { Component } from '@angular/core'
import { AnimViewDirective } from '../../directives/anim-view.directive'
import { CardComponent } from '../ui/card.component'
import { SectionTitleComponent } from '../ui/section-title.component'
import { STAGGER_FADE } from '../../animations'

type IconType = 'cerk' | 'location' | 'rings' | 'cake'

interface ProgramItem {
  icon: IconType
  time: string
  title: string
}

@Component({
  selector: 'app-program',
  standalone: true,
  imports: [AnimViewDirective, CardComponent, SectionTitleComponent],
  animations: [STAGGER_FADE],
  templateUrl: './program.component.html',
})
export class ProgramComponent {
  readonly program: ProgramItem[] = [
    { icon: 'cerk',   time: '13:00', title: 'Шлюб у храмі' },
    { icon: 'location', time: '14:30', title: 'Welcome drinks, збір гостей' },
    { icon: 'rings',    time: '15:00', title: 'Весільна церемонія, початок святкування' },
    { icon: 'cake',     time: '22:00', title: 'На коня і по домах' },
  ]
}
