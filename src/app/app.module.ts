import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes, Route, UrlSegment, UrlSegmentGroup } from '@angular/router';
import { UrlMatchResult } from '@angular/router/src/config';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AngularFireModule } from '@angular/fire'
import { AngularFirestoreModule } from '@angular/fire/firestore'
import { environment } from '../environments/environment'
import { AppComponent } from './app.component';

import { MusicService } from '../services/music';
import { SpeechService } from '../services/speech';
import { RotatingPhraseComponent } from './phrase/rotating-phrase.component';
import { StaticPhraseComponent } from './phrase/static-phrase.component';

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
console.log(environment.firebase)
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
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    RouterModule.forRoot(routes),
  ],
  providers: [
    MusicService,
    SpeechService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
