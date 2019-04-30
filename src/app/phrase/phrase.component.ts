import {map, switchMap, tap, shareReplay} from 'rxjs/operators';
import { OnInit, OnDestroy, Host } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import * as Color from 'color';
import * as random from 'seedrandom';

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
  protected FONTS = ['Baloo', 'Crimson Text', 'Gidugu', 'Griffy', 'Indie Flower', 'Raleway', 'Ranga', 'Roboto', 'Supermercado One'];

  constructor(
    protected db: AngularFirestore,
    protected music: MusicService,
    protected speech: SpeechService,
    protected route: ActivatedRoute,
    @Host() protected parent: AppComponent) {

  }

  ngOnInit(): void {
    this.phraseString$ = this.phraseDocument$.pipe(
      switchMap((doc) => doc.valueChanges()),
      tap((phrase) => console.log(phrase)),
      map((phrase) => phrase.words),
      shareReplay(),
    )

    this.speechSubscription = this.phraseString$.pipe(switchMap((phrase) => this.speech.speak$(phrase))).subscribe()
    this.colourSubscription = this.phraseString$.subscribe((phrase) => this.parent.currentColour = this.newColor(phrase))
    this.font$ = this.phraseString$.pipe(map((phrase) => this.newFont(phrase)))
    this.music.play();
  }

  ngOnDestroy(): void {
    this.music.stop();
    this.speechSubscription.unsubscribe()
    this.colourSubscription.unsubscribe()
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
