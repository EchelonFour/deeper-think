import { Component, OnInit, OnDestroy, Host } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable, Observer, Subscription } from 'rxjs/Rx';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { PhraseComponent } from './phrase.component';
import * as _ from 'lodash';
import * as Color from 'color';
import * as random from 'seedrandom';
import * as Clipboard from 'clipboard';

import { AppComponent } from '../app.component';
import { MusicService } from '../../services/music';
import { SpeechService } from '../../services/speech';

@Component({
  selector: 'app-static-phrase',
  templateUrl: './static-phrase.component.html',
  styleUrls: ['./phrase.component.css']
})
export class StaticPhraseComponent extends PhraseComponent {
  protected clipboard: Clipboard;
  clipboardResults$: Observable<string>;

  constructor(
    af: AngularFire,
    music: MusicService,
    speech: SpeechService,
    route: ActivatedRoute,
    parent: AppComponent) {
      super(af, music, speech, route, parent)
  }

 ngOnInit(): void {
    this.phraseId$ = this.route.params.map((params: Params) => params['id'])
    this.clipboard = new Clipboard('.clippy')
    super.ngOnInit()
    this.clipboardResults$ = this.phraseString$.combineLatest(this.phraseId$, (phrase, id) => `${phrase} https://deeperth.ink/${id}`)
  }

  ngOnDestroy(): void {
    this.clipboard.destroy()
    super.ngOnDestroy()
  }

}
