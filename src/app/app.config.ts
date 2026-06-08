import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { ArrowRight, Heart, LucideAngularModule, LUCIDE_ICONS } from 'lucide-angular'

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    { provide: LUCIDE_ICONS, useValue: [ArrowRight, Heart], multi: true },
  ],
}
