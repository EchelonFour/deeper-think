import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AngularFireModule, FirebaseAppConfig } from 'angularfire2';

import { AppComponent } from './app.component';

import { MusicService } from '../services/music';
import { SpeechService } from '../services/speech';
import { PhraseComponent } from './phrase/phrase.component';

const firebaseConfig: FirebaseAppConfig = {
  apiKey: 'AIzaSyBF_TsfgjGmsojPqdmezj5LbbzQM-uDwes',
  authDomain: 'deeper-think.firebaseapp.com',
  databaseURL: 'https://deeper-think.firebaseio.com',
  storageBucket: 'deeper-think.appspot.com'
};

const routes: Routes = [
  { path: '', component: PhraseComponent },
  { path: ':id', component: PhraseComponent },
]
@NgModule({
  declarations: [
    AppComponent,
    PhraseComponent
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
