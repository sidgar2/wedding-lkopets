import {
  Component,
  OnDestroy,
  signal,
  ElementRef,
  ViewChild,
  AfterViewInit,
  inject,
} from '@angular/core'
import { GuestService } from '../../services/guest.service'

const TRACKS = [
  'assets/music.mp3',
  'assets/music1.mp3',
  'assets/music2.mp3',
  'assets/music3.mp3',
  'assets/music4.mp3',
  'assets/music5.mp3',
]

@Component({
  selector: 'app-music-player',
  standalone: true,
  imports: [],
  template: `
    <audio #audio loop preload="auto"></audio>

    <button
      (click)="toggle()"
      class="fixed bottom-6 right-5 z-50 w-11 h-11 rounded-full bg-mocha/90 text-cream flex items-center justify-center shadow-lg transition-all duration-300 active:scale-95"
      [attr.aria-label]="playing() ? 'Зупиники музику' : 'Грати музику'"
    >
      @if (playing()) {
        <span class="flex gap-[3px] items-end h-4">
          <span class="w-[3px] bg-cream rounded-full animate-bar1"></span>
          <span class="w-[3px] bg-cream rounded-full animate-bar2"></span>
          <span class="w-[3px] bg-cream rounded-full animate-bar3"></span>
        </span>
      } @else {
        <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
          <path d="M2 1.5v13L13 8 2 1.5z"/>
        </svg>
      }
    </button>
  `,
  styles: [`
    @keyframes bar1 { 0%,100%{height:6px} 50%{height:16px} }
    @keyframes bar2 { 0%,100%{height:12px} 50%{height:6px} }
    @keyframes bar3 { 0%,100%{height:8px} 50%{height:14px} }
    .animate-bar1 { height: 6px; animation: bar1 0.8s ease-in-out infinite; }
    .animate-bar2 { height: 12px; animation: bar2 0.8s ease-in-out infinite 0.15s; }
    .animate-bar3 { height: 8px; animation: bar3 0.8s ease-in-out infinite 0.3s; }
  `],
})
export class MusicPlayerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('audio') private audioRef!: ElementRef<HTMLAudioElement>

  private guestService = inject(GuestService)

  playing = signal(false)
  started = signal(false)
  private trackIndex = signal(0)

  private get multiTrack(): boolean {
    return this.guestService.guest()?.multiTrack === true
  }

  private onTouchStart = () => {
    this.play()
    window.removeEventListener('touchstart', this.onTouchStart)
    window.removeEventListener('pointerdown', this.onPointerDown)
  }

  private onPointerDown = () => {
    const audio = this.audioRef.nativeElement
    audio.play().then(() => audio.pause()).catch(() => {})
    window.removeEventListener('pointerdown', this.onPointerDown)
    window.removeEventListener('touchstart', this.onTouchStart)
    window.addEventListener('scroll', this.onScroll, { passive: true })
  }

  private onScroll = () => {
    if (window.scrollY > 10) {
      this.play()
      window.removeEventListener('scroll', this.onScroll)
    }
  }

  ngAfterViewInit(): void {
    this.audioRef.nativeElement.src = TRACKS[0]
    window.addEventListener('touchstart', this.onTouchStart, { passive: true })
    window.addEventListener('pointerdown', this.onPointerDown, { passive: true })
  }

  ngOnDestroy(): void {
    window.removeEventListener('touchstart', this.onTouchStart)
    window.removeEventListener('pointerdown', this.onPointerDown)
    window.removeEventListener('scroll', this.onScroll)
  }

  toggle(): void {
    if (this.playing()) {
      if (this.multiTrack) {
        this.nextTrack()
      } else {
        this.pause()
      }
    } else {
      this.play()
    }
  }

  private nextTrack(): void {
    const next = (this.trackIndex() + 1) % TRACKS.length
    this.trackIndex.set(next)
    const audio = this.audioRef.nativeElement
    audio.src = TRACKS[next]
    audio.play().catch(() => {})
  }

  private play(): void {
    this.audioRef.nativeElement.play().catch(() => {})
    this.playing.set(true)
    this.started.set(true)
  }

  private pause(): void {
    this.audioRef.nativeElement.pause()
    this.playing.set(false)
  }
}
