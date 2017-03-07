import { Component, HostBinding } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable, Observer, Subscription } from 'rxjs/Rx';
import { AngularFire } from 'angularfire2';
import * as _ from 'lodash';
import * as Color from 'color';
import * as random from 'seedrandom';

import { MusicService } from '../services/music';
import { SpeechService } from '../services/speech';

@Component({
  selector: 'body',
  templateUrl: './app.component.html'
})
export class AppComponent {
  @HostBinding('style.background-color') currentColour: Color.Color = Color('hsl(200, 50%, 90%)');


  constructor() {

  }

}
