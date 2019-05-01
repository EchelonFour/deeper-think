import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable, timer } from 'rxjs';
import * as firebase from 'firebase/app';
import { debounce, mergeMap, mapTo, tap } from 'rxjs/operators';

interface Tick {
  tick: firebase.firestore.Timestamp
}
@Injectable()
export class TickerService {

  public readonly ticking$: Observable<true>
  private tick$: AngularFirestoreDocument<Tick>
  constructor(private db: AngularFirestore) {
    this.tick$ = this.db.doc<Tick>('/tick/tick')
    this.ticking$ = this.tick$.valueChanges().pipe(
      debounce((tick) => {
        const waitTime = this.calcWaitTime(tick.tick)
        console.log('waiting millis: ', waitTime)
        return timer(waitTime)
      }),
      mergeMap(() => this.sendTick()),
      mapTo<void, true>(true)
    )
  }

  private calcWaitTime(lastTick: firebase.firestore.Timestamp) {
    if (lastTick == null) {
      return 5000
    }
    const now = firebase.firestore.Timestamp.now()
    const diff = now.toMillis() - lastTick.toMillis()
    const timeUntilNextTick = 30300 - diff //30 seconds and bit extra to be sure
    const waitTime = Math.max(timeUntilNextTick, 5000) //wait at least 5 seconds
    return Math.min(waitTime, 31000) // wait at most 31 seconds
  }

  private async sendTick() {
    console.log('sending update tick')
    try {
      await this.tick$.update({tick: firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp})
      console.log('you sent the tick. you are the best👍')
    } catch (e) {
      console.log('couldnt send the tick, doesnt matter')
    }
  }
}
