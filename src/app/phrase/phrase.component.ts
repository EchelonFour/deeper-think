import {map, switchMap, tap, shareReplay} from 'rxjs/operators';
import { OnInit, OnDestroy, Host, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import * as Color from 'color';
import * as random from 'seedrandom';
import { faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';

import { AppComponent } from '../app.component';
import { MusicService } from '../../services/music';
import { SpeechService } from '../../services/speech';

export interface Phrase {
  words: string
  createdAt: Date
  origin: any[]
}
export class PhraseComponent implements OnInit, OnDestroy {
  phraseString$: Observable<string>;
  phraseDocument$: Observable<AngularFirestoreDocument<Phrase>>;
  font$: Observable<string>;
  speechSubscription: Subscription;
  colourSubscription: Subscription;
  paused = true;
  protected mouseUnlisten: () => void = null;
  protected touchUnlisten: () => void = null;
  protected FONTS = ['Baloo', 'Crimson Text', 'Gidugu', 'Griffy', 'Indie Flower', 'Raleway', 'Ranga', 'Roboto', 'Supermercado One'];

  constructor(
    protected db: AngularFirestore,
    protected music: MusicService,
    protected speech: SpeechService,
    protected route: ActivatedRoute,
    protected renderer: Renderer2,
    @Host() protected parent: AppComponent,) {

  }

  ngOnInit(): void {
    this.phraseString$ = this.phraseDocument$.pipe(
      switchMap((doc) => doc.valueChanges()),
      tap((phrase) => console.log(phrase)),
      map((phrase) => phrase.words),
      shareReplay(),
    )
    if (this.music.audioAllowed()) {
      this.startNoise()
    } else {
      this.mouseUnlisten = this.renderer.listen('window', 'mouseup', () => {
        this.startNoiseOnAllowed()
      })
      this.touchUnlisten = this.renderer.listen('window', 'touchend', () => {
        this.startNoiseOnAllowed()
      })
    }

    this.colourSubscription = this.phraseString$.subscribe((phrase) => this.parent.currentColour = this.newColor(phrase))
    this.font$ = this.phraseString$.pipe(map((phrase) => this.newFont(phrase)))
  }

  ngOnDestroy(): void {
    this.stopNoise()
    this.colourSubscription.unsubscribe()
  }

  protected startNoiseOnAllowed() {
    this.startNoise()
    if (this.mouseUnlisten) {
      this.mouseUnlisten()
    }
    if (this.touchUnlisten) {
      this.touchUnlisten()
    }
  }
  toggleNoise() {
    if (this.paused) {
      this.startNoise()
    } else {
      this.stopNoise()
    }
  }
  noiseIcon() {
    if (this.paused) {
      return faVolumeMute
    }
    return faVolumeUp
  }
  protected startNoise() {
    this.paused = false
    if (!this.speechSubscription) {
      this.speechSubscription = this.phraseString$.pipe(switchMap((phrase) => this.speech.speak$(phrase))).subscribe()
    }
    this.music.play()
  }
  protected stopNoise() {
    this.paused = true
    if (this.speechSubscription) {
      this.speechSubscription.unsubscribe()
      this.speechSubscription = null
    }
    this.music.stop()
  }

  protected range(seed: string, lower: number, upper: number) {
    const r = random(seed)
    return lower + Math.floor(r() * (upper - lower + 1))
  }
  newFont(phrase: string): string {
    return `${this.FONTS[this.range(phrase, 0, this.FONTS.length - 1)]}, sans-serif`;
  }
  newColor(phrase: string): Color.Color {
    return this.parent.currentColour.hue(this.range(phrase, 0, 360))
  }

}
