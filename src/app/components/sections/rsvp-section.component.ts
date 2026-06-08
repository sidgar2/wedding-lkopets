import { Component, OnDestroy, inject, signal, computed } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { AnimViewDirective } from '../../directives/anim-view.directive'
import { CardComponent } from '../ui/card.component'
import { SectionTitleComponent } from '../ui/section-title.component'
import { StepperComponent } from '../ui/stepper.component'
import { RadioPillsComponent, PillOption } from '../ui/radio-pills.component'
import { FormFieldComponent } from '../ui/form-field.component'
import { ButtonDirective } from '../ui/button.directive'
import { STAGGER_FADE, FORM_SWAP } from '../../animations'
import { GuestService } from '../../services/guest.service'
import { submitRSVP } from '../../lib/rsvp'

const ATTENDANCE_OPTIONS: PillOption[] = [
  { value: 'yes', label: '✓ Буду' },
  { value: 'no', label: '✗ Не зможу' },
  { value: 'maybe', label: '〜 Ще вагаюсь' },
]

@Component({
  selector: 'app-rsvp-section',
  standalone: true,
  imports: [
    FormsModule,
    AnimViewDirective,
    CardComponent,
    SectionTitleComponent,
    StepperComponent,
    RadioPillsComponent,
    FormFieldComponent,
    ButtonDirective,
  ],
  animations: [STAGGER_FADE, FORM_SWAP],
  templateUrl: './rsvp-section.component.html',
})
export class RsvpSectionComponent implements OnDestroy {
  readonly guestService = inject(GuestService)

  readonly attendanceOptions = ATTENDANCE_OPTIONS

  name = ''
  wishes = ''
  readonly attendance = signal<'yes' | 'no' | 'maybe'>('yes')
  readonly guestCount = signal(1)
  readonly nameError = signal('')
  readonly serverError = signal('')
  readonly loading = signal(false)
  readonly submitted = signal(false)

  private debounceTimer?: ReturnType<typeof setTimeout>

  async submit(): Promise<void> {
    if (!this.name.trim()) {
      this.nameError.set('Вкажіть ваше ім\'я')
      return
    }

    clearTimeout(this.debounceTimer)
    this.debounceTimer = setTimeout(async () => {
      this.loading.set(true)
      this.serverError.set('')
      try {
        await submitRSVP({
          name: this.name.trim(),
          attendance: this.attendance(),
          guestCount: this.guestCount(),
          wishes: this.wishes.trim(),
          guestCode: this.guestService.code ?? undefined,
        })
        this.submitted.set(true)
      } catch (err) {
        this.serverError.set('Помилка надсилання. Спробуйте ще раз.')
      } finally {
        this.loading.set(false)
      }
    }, 300)
  }

  ngOnDestroy(): void {
    clearTimeout(this.debounceTimer)
  }
}
