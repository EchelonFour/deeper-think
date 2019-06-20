import {map, switchMap, tap, shareReplay, startWith, first} from 'rxjs/operators';
import { OnInit, OnDestroy, Host, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import * as Color from 'color';
import * as random from 'seedrandom';
import { faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';

import { AppComponent } from '../app.component';
import { MusicService } from '../../services/music';
import { SpeechService } from '../../services/speech';
import * as firebase from 'firebase/app';

export interface Phrase {
  words: string
  createdAt: Date
  origin: any[]
}
export interface Upvote {
  votes: number
  needsAggregation: boolean
}
const NUMBER_OF_VOTE_SHARDS = 5
export class PhraseComponent implements OnInit, OnDestroy {
  phraseString$: Observable<string>;
  phraseDocument$: Observable<AngularFirestoreDocument<Phrase>>;
  upvoteCollection$: Observable<AngularFirestoreCollection<Upvote>>;
  upvoteNumber$: Observable<number>;
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
    this.upvoteCollection$ = this.phraseDocument$.pipe(
      map((doc) => doc.collection('upvotes'))
    )
    this.phraseString$ = this.phraseDocument$.pipe(
      switchMap((doc) => doc.valueChanges()),
      tap((phrase) => console.log(phrase)),
      map((phrase) => phrase.words),
      shareReplay(1),
    )
    this.upvoteNumber$ = this.upvoteCollection$.pipe(
      switchMap((doc) => doc.valueChanges()),
      tap((upvotes) => console.log('upvotes', upvotes)),
      map((upvotes) => upvotes.reduce((runningTotal, upvote)=> runningTotal + upvote.votes, 0)),
      startWith(0),
      shareReplay(1),
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

  public async upvote(): Promise<void> {
    const upvoteCollection = await this.upvoteCollection$.pipe(first()).toPromise()
    const upvoteDoc = upvoteCollection.doc<Upvote>(Math.floor(Math.random() * NUMBER_OF_VOTE_SHARDS).toString())
    console.log('sending updoot', upvoteDoc.ref.path)
    await upvoteDoc.set({
      votes: firebase.firestore.FieldValue.increment(1) as unknown as number, //like, I know
      needsAggregation: true,
    }, {merge: true})
  }
}
