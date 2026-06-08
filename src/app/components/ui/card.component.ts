import { Component, input } from '@angular/core'
import { NgClass } from '@angular/common'

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgClass],
  templateUrl: './card.component.html',
})
export class CardComponent {
  readonly noPadding = input(false)
}
