import { Component, input, model } from '@angular/core'

@Component({
  selector: 'app-stepper',
  standalone: true,
  templateUrl: './stepper.component.html',
})
export class StepperComponent {
  readonly value = model.required<number>()
  readonly min = input(1)
  readonly max = input(10)

  increment(): void {
    if (this.value() < this.max()) this.value.set(this.value() + 1)
  }

  decrement(): void {
    if (this.value() > this.min()) this.value.set(this.value() - 1)
  }
}
