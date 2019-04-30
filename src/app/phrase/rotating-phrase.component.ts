import { Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable, Observer, Subscription } from 'rxjs';
import { AngularFire } from 'angularfire2';
import { PhraseComponent } from './phrase.component';

import { AppComponent } from '../app.component';
import { MusicService } from '../../services/music';
import { SpeechService } from '../../services/speech';

@Component({
  selector: 'app-rotating-phrase',
  templateUrl: './rotating-phrase.component.html',
  styleUrls: ['./phrase.component.css']
})
export class RotatingPhraseComponent extends PhraseComponent {

  constructor(
    af: AngularFire,
    music: MusicService,
    speech: SpeechService,
    route: ActivatedRoute,
    parent: AppComponent) {
      super(af, music, speech, route, parent)
  }

 ngOnInit(): void {
    this.phraseId$ = this.af.database.object('/currentPhrase').map((ref) => ref.$value)
    super.ngOnInit()

  }

  ngOnDestroy(): void {
    super.ngOnDestroy()
  }

}
