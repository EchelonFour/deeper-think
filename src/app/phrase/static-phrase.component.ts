import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { PhraseComponent } from './phrase.component';
import * as Clipboard from 'clipboard';

import { AppComponent } from '../app.component';
import { MusicService } from '../../services/music';
import { SpeechService } from '../../services/speech';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-static-phrase',
  templateUrl: './static-phrase.component.html',
  styleUrls: ['./phrase.component.css']
})
export class StaticPhraseComponent extends PhraseComponent {
  protected clipboard: Clipboard;
  clipboardResults$: Observable<string>;

  constructor(
    db: AngularFirestore,
    music: MusicService,
    speech: SpeechService,
    route: ActivatedRoute,
    parent: AppComponent) {
      super(db, music, speech, route, parent)
  }

  ngOnInit(): void {
    const phraseId$ = this.route.params.pipe(map((params) => params['id'] as string))
    this.phraseDocument$ = phraseId$.pipe(map((id) => this.db.collection('phrases').doc(id)))
    this.clipboard = new Clipboard('.clippy')
    super.ngOnInit()
    this.clipboardResults$ = combineLatest(
      this.phraseString$,
      phraseId$
    ).pipe(map((phrase) => `${phrase[0]} https://deeperth.ink/${phrase[1]}`))
  }

  ngOnDestroy(): void {
    this.clipboard.destroy()
    super.ngOnDestroy()
  }

}
