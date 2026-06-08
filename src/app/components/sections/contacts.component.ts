import { Component } from '@angular/core'
import { AnimViewDirective } from '../../directives/anim-view.directive'
import { CardComponent } from '../ui/card.component'
import { SectionTitleComponent } from '../ui/section-title.component'
import { ButtonDirective } from '../ui/button.directive'
import { STAGGER_FADE } from '../../animations'

interface Contact {
  name: string
  role: string
  phone: string
}

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [AnimViewDirective, CardComponent, SectionTitleComponent, ButtonDirective],
  animations: [STAGGER_FADE],
  templateUrl: './contacts.component.html',
})
export class ContactsComponent {
  readonly contacts: Contact[] = [
    { name: "Ім'я Прізвище", role: 'Організатор', phone: '+380XXXXXXXXX' },
    { name: "Ім'я Прізвище", role: 'Розпорядник', phone: '+380XXXXXXXXX' },
  ]
}
