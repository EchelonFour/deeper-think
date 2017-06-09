import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes, Route, UrlSegment, UrlSegmentGroup } from '@angular/router';
import { UrlMatchResult } from '@angular/router/src/config';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AngularFireModule, FirebaseAppConfig } from 'angularfire2';

import { AppComponent } from './app.component';

import { MusicService } from '../services/music';
import { SpeechService } from '../services/speech';
import { RotatingPhraseComponent } from './phrase/rotating-phrase.component';
import { StaticPhraseComponent } from './phrase/static-phrase.component';

const firebaseConfig: FirebaseAppConfig = {
  apiKey: 'AIzaSyBF_TsfgjGmsojPqdmezj5LbbzQM-uDwes',
  authDomain: 'deeper-think.firebaseapp.com',
  databaseURL: 'https://deeper-think.firebaseio.com',
  storageBucket: 'deeper-think.appspot.com'
};
//this wont work until https://github.com/angular/angular/issues/14833 resolved
// function optionalId(segments: UrlSegment[], group: UrlSegmentGroup, route: Route): UrlMatchResult {
//   if (segments.length == 1) {
//     return {consumed: segments, posParams: {id: segments[0]}}
//   }
//    return {consumed: segments}
  
// }
const routes: Routes = [
  //{ component: PhraseComponent, matcher: optionalId },
  { path: '', component: RotatingPhraseComponent },
  { path: ':id', component: StaticPhraseComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
]
@NgModule({
  declarations: [
    AppComponent,
    RotatingPhraseComponent,
    StaticPhraseComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig),
    RouterModule.forRoot(routes),
  ],
  providers: [
    MusicService,
    SpeechService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
