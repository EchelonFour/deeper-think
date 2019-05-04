import * as firebase from 'firebase-admin'
firebase.initializeApp({
    credential: firebase.credential.applicationDefault(),
    databaseURL: "https://deeper-think.firebaseio.com",
})
const database = firebase.database()
const firestore = firebase.firestore()
const phrasesRef = firestore.collection('phrases')
async function migrate() {
    console.log('getting phrases')
    const oldPhrases = (await database.ref('phrases').once('value')).val()
    let currentBatch = firestore.batch()
    let currentBatchCount = 0
    for (const key of Object.keys(oldPhrases)) {
        console.log('processing', key, 'with phrase', oldPhrases[key].phrase)
        const newPhrase = phrasesRef.doc(key)
        currentBatch.create(newPhrase, {
            words: oldPhrases[key].phrase,
            migrated: true,
        })
        currentBatchCount += 1
        if (currentBatchCount >= 500) {
            console.log('commiting batch')
            await currentBatch.commit()
            currentBatch = firestore.batch()
            currentBatchCount = 0
        }
    }
}

migrate().then(() => {
    console.log('done')
}).catch((err) => {
    console.error('error', err)
})