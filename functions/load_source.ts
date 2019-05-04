import * as firebase from 'firebase-admin'
import { readFileSync } from 'fs';
firebase.initializeApp({
    credential: firebase.credential.applicationDefault(),
    databaseURL: "https://deeper-think.firebaseio.com",
})
const firestore = firebase.firestore()
const sourcesRef = firestore.collection('sources')
async function load() {
    console.log('getting phrases')
    const sources: {sentences: string[]} = JSON.parse(readFileSync(process.argv[2], 'utf8'))
    let currentBatch = firestore.batch()
    let currentBatchCount = 0
    for (const sentence of sources.sentences) {
        console.log('processing', sentence)
        const newSource = sourcesRef.doc()
        currentBatch.create(newSource, {
            source: sentence,
        })
        currentBatchCount += 1
        if (currentBatchCount >= 50) {
            console.log('commiting batch')
            await currentBatch.commit()
            currentBatch = firestore.batch()
            currentBatchCount = 0
            console.log('waiting, to applease a rate limiter')
            await new Promise(resolve => setTimeout(resolve, 5000))
        }
    }
}

load().then(() => {
    console.log('done')
}).catch((err) => {
    console.error('error', err)
})