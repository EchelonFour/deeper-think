const functions = require('firebase-functions')
const admin = require('firebase-admin')
const fs = require('fs')
const cheerio = require('cheerio')

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
        db.ref(`/phrases/${request.path}`).once('value').then((snapshot) => {
            const phrase = snapshot.val()
            if (!phrase || !phrase.phrase) {
                response.redirect('/')
                return
            }
            const phraseString = phrase.phrase
            const html = cheerio.load(data)
            html("meta[property='og:description']").attr('content', phraseString)
            html("meta[property='og:url']").attr('content', request.originalUrl)
            const htmlString = html.html()
            response.set('Cache-Control', 'public, max-age=3600, s-maxage=3600')
            response.send(htmlString)
        }).catch((err) => {
            response.redirect('/')
            return
        })
    })
});
