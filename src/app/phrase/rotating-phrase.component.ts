import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PhraseComponent } from './phrase.component';

import { AppComponent } from '../app.component';
import { MusicService } from '../../services/music';
import { SpeechService } from '../../services/speech';
import { AngularFirestore } from '@angular/fire/firestore';
import { map, share, shareReplay } from 'rxjs/operators';
import * as firebase from 'firebase'
import { Observable } from 'rxjs';

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
  constructor(
    db: AngularFirestore,
    music: MusicService,
    speech: SpeechService,
    route: ActivatedRoute,
    parent: AppComponent) {
      super(db, music, speech, route, parent)
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
    super.ngOnInit()
  }

}
