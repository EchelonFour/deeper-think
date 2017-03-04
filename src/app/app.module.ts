import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AngularFireModule, FirebaseAppConfig } from 'angularfire2';

import { AppComponent } from './app.component';

import { MusicService } from '../services/music';
import { SpeechService } from '../services/speech';

const firebaseConfig: FirebaseAppConfig = {
  apiKey: 'AIzaSyBF_TsfgjGmsojPqdmezj5LbbzQM-uDwes',
  authDomain: 'deeper-think.firebaseapp.com',
  databaseURL: 'https://deeper-think.firebaseio.com',
  storageBucket: 'deeper-think.appspot.com',
  messagingSenderId: '628206458048',
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig),
  ],
  providers: [
    MusicService,
    SpeechService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
