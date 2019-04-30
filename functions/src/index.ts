import * as functions from 'firebase-functions'
import * as fs from 'fs-extra'
import * as language from '@google-cloud/language'
import * as cheerio from 'cheerio'
import { firestore, database } from './firebase'
import { NLPToTree } from './nlp_process'
import { generatePhrase } from './generate';

export const prerender = functions.https.onRequest(async (req, res) => {
    try {
        const data = await fs.readFile('index.html', 'utf8')
        const snapshot = await database.ref(`/phrases/${req.path}`).once('value')

        const phrase = snapshot.val()
        if (!phrase || !phrase.phrase) {
            throw new Error('404 probably')
        }
        const phraseString = phrase.phrase
        const html = cheerio.load(data)
        html("meta[property='og:description']").attr('content', phraseString)
        html("meta[property='og:url']").attr('content', req.originalUrl)
        const htmlString = html.html()
        res.type('html')
        res.end(htmlString)
    } catch (e) {
        console.error('some kinda error i guess', e)
        res.redirect('/')
    }
})

export const newSource = functions.firestore.document('sources/{sourceId}').onCreate(async (event, context) => {
    const source = event.data().source
    if (event.data().syntax) {
        console.warn('already processed this one, SKIP')
        return
    }
    console.info('new source', source)
    const existing = await firestore.collection('sources').where('source', '==', source).limit(2).get()
    if (existing.docs.length > 1) {
        let existingId = event.id
        if (existingId !== existing.docs[0].id) {
            existingId = existing.docs[1].id
        }
        console.warn('already found a sentence like that', existingId)
        await event.ref.delete()
        return
    }
    const client = new language.LanguageServiceClient()
    const syntax = (await client.analyzeSyntax({document: {
        content: source,
        type: 'PLAIN_TEXT'
    }}))[0]
    console.log(syntax)
    await event.ref.update({syntax})
    const leafs = NLPToTree(syntax)
    const batch = firestore.batch()
    for (const leaf of leafs) {
        const savable = leaf.toDBLeaf(event.ref)
        console.info('DB Leaf to be saved', leaf.id, savable)
        batch.create(leaf.id, savable)
    }
    await batch.commit()
})

export const tick = functions.firestore.document('tick/tick').onWrite(async (event, context) => {
    console.log('tick at', event.after.data().tick)
    const phraseId = await generatePhrase()
    await firestore.collection('tick').doc('currentPhrase').set({
        id: phraseId
    })
})
