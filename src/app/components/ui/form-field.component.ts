import { Component, input } from '@angular/core'
import { ERROR_FADE } from '../../animations'

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [],
  animations: [ERROR_FADE],
  templateUrl: './form-field.component.html',
})
export class FormFieldComponent {
  readonly label = input('')
  readonly error = input('')
}
