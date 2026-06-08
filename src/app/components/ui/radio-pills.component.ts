import { Component, input, model } from '@angular/core'
import { NgClass } from '@angular/common'

export interface PillOption {
  value: string
  label: string
}

@Component({
  selector: 'app-radio-pills',
  standalone: true,
  imports: [NgClass],
  templateUrl: './radio-pills.component.html',
})
export class RadioPillsComponent {
  readonly options = input.required<PillOption[]>()
  readonly value = model.required<string>()
}
