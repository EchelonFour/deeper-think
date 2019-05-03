import { Component, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PhraseComponent } from './phrase.component';

import { AppComponent } from '../app.component';
import { MusicService } from '../../services/music';
import { SpeechService } from '../../services/speech';
import { AngularFirestore } from '@angular/fire/firestore';
import { map, shareReplay } from 'rxjs/operators';
import * as firebase from 'firebase/app'
import { Observable, Subscription } from 'rxjs';
import { TickerService } from '../../services/ticker';
import { faShare } from '@fortawesome/free-solid-svg-icons';

interface CurrentPhrase {
  id: firebase.firestore.DocumentReference
}

@Component({
  selector: 'app-rotating-phrase',
  templateUrl: './rotating-phrase.component.html',
  styleUrls: ['./phrase.component.css']
})
export class RotatingPhraseComponent extends PhraseComponent {
  public phraseUrl$: Observable<string>
  private tickerSubscription: Subscription
  shareIcon = faShare
  constructor(
    db: AngularFirestore,
    music: MusicService,
    speech: SpeechService,
    route: ActivatedRoute,
    renderer: Renderer2,
    parent: AppComponent,
    private ticker: TickerService,
    ) {
      super(db, music, speech, route, renderer, parent)
  }

  ngOnInit(): void {
    const currentRef = this.db.doc<CurrentPhrase>('/tick/currentPhrase').valueChanges().pipe(
      shareReplay()
    )
    this.phraseUrl$ = currentRef.pipe(map((ref) => `/${ref.id.id}`))
    this.phraseDocument$ = currentRef.pipe(
      map((phraseRef) => {
        console.log(phraseRef)
        return this.db.doc(phraseRef.id.path)
      })
    )
    this.tickerSubscription = this.ticker.ticking$.subscribe()
    super.ngOnInit()
  }

  ngOnDestroy(): void {
    this.tickerSubscription.unsubscribe()
    super.ngOnDestroy()
  }

}
