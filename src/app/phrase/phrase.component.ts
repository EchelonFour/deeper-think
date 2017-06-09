import { Component, OnInit, OnDestroy, Host } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable, Observer, Subscription } from 'rxjs/Rx';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import * as _ from 'lodash';
import * as Color from 'color';
import * as random from 'seedrandom';

import { AppComponent } from '../app.component';
import { MusicService } from '../../services/music';
import { SpeechService } from '../../services/speech';

export class PhraseComponent implements OnInit, OnDestroy {
  phraseString$: Observable<string>;
  phraseId$: Observable<string>;
  font$: Observable<string>;
  speechSubscription: Subscription;
  colourSubscription: Subscription;
  protected FONTS = ['Baloo', 'Crimson Text', 'Gidugu', 'Griffy', 'Indie Flower', 'Raleway', 'Ranga', 'Roboto', 'Supermercado One'];

  constructor(
    protected af: AngularFire,
    protected music: MusicService,
    protected speech: SpeechService,
    protected route: ActivatedRoute,
    @Host() protected parent: AppComponent) {

  }

 ngOnInit(): void {
    this.phraseString$ = this.phraseId$.switchMap((id) => {
      return this.af.database.object(`/phrases/${id}`).map((ref) => ref.phrase)
    })

    this.speechSubscription = this.phraseString$.switchMap((phrase) => this.speech.speak$(phrase)).subscribe()
    this.colourSubscription = this.phraseString$.subscribe((phrase) => this.parent.currentColour = this.newColor(phrase))
    this.font$ = this.phraseString$.map((phrase) => this.newFont(phrase))
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
