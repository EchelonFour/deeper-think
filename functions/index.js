const functions = require('firebase-functions')
const admin = require('firebase-admin')
const fs = require('fs')

admin.initializeApp(functions.config().firebase)

const db = admin.database()
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.prerender = functions.https.onRequest((request, response) => {
    fs.readFile('index.html', 'utf8', (err, data) => {
        if (err) {
            response.redirect('/')
            return
        }
        db.ref(`/phrases/${request.path}`).once('value', (snapshot) => {
            const phrase = snapshot.val()
            if (!phrase || !phrase.phrase) {
                response.redirect('/')
                return
            }
            const phraseString = phrase.phrase
            console.log('phrase', phraseString)
            let html = data
            console.log(html)
            html = html.replace(/{{ QUOTE }}/g, phraseString)
            html = html.replace(/{{ URL }}/g, request.originalUrl)
            response.send(html)
        }, (err) => {
            response.redirect('/')
            return
        })
    })
});
