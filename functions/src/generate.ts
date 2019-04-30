import { Leaf, PseudoLeaf } from './leaf'
import firebase, { firestore } from './firebase'
import randomNumber from './random';
// tslint:disable-next-line:no-implicit-dependencies
import { Query, DocumentSnapshot } from '@google-cloud/firestore';

export interface Phrase {
    id: string
    words: string
    createdAt: Date | FirebaseFirestore.FieldValue
}
function getRandomAlphaNumeric(): string {
    //this looks weird, but works better than anything else
    return Math.random().toString(36).substring(2, 8)
}
const leafRef = firestore.collection('leafs')
const phrasesRef = firestore.collection('phrases')
async function getRandomSample(query: Query): Promise<DocumentSnapshot> {
    console.log('running random query', query)
    const random = randomNumber()
    let leaf = await query.where('random', '>', random).orderBy('random').limit(1).get()

    if (leaf.empty) {
        leaf = await query.where('random', '<=', random).orderBy('random').limit(1).get()
    }
    return leaf.docs[0]
}
async function getRandomSampleBy(leaf: PseudoLeaf, ...keys: (keyof PseudoLeaf)[]): Promise<Leaf> {
  console.log('finding a leaf with these keys: ', keys)
  let query: Query = null
  for (const key of keys) {
    query = (query || leafRef).where(key, '==', leaf[key])
  }
  return Leaf.convertFromDb(await getRandomSample(query))
}
export async function somethingLikeThis(leaf: PseudoLeaf, parentIsRoot = false): Promise<Leaf> {
  console.log('trying to find something like ', leaf)
  if (leaf.metaroot) {
    console.log('it looks like a metaroot, finding another metaroot')
    return Leaf.convertFromDb(await getRandomSample(leafRef.where('metaroot', '==', true)))
  }
  if (leaf.treeSize === 1) {
    console.log('psudo leaf is one option, filling with that option')
    return Leaf.convertFromPseudoLeaf(leaf)
  }
  const smallishTreeSize = Math.floor(Math.random() * 3) + 1
  console.log('smallish tree size this time is ', smallishTreeSize)
  if (leaf.tag !== 'PUNCT' && parentIsRoot && leaf.treeSize < smallishTreeSize && Math.random() < 0.5) {
    console.log('the sentance is short, but we a forcing a shuffle so it isnt just the same as a source sentence')
    return await getRandomSampleBy(leaf, 'label', 'tag')
  }
  if (leaf.tag === 'PUNCT' || leaf.label === 'ROOT' || leaf.treeSize < smallishTreeSize) {
    console.log('leaf is core enough that we are just getting the real word')
    return Leaf.getAndConvertFromDb(leaf.realLeaf)
  }

  const randomness = Math.random()

  if (randomness < 0.20) {
    return getRandomSampleBy(leaf, 'label')
  }
  if (randomness < 0.40) {
    return getRandomSampleBy(leaf, 'tag')
  }
  if (randomness < 0.60) {
    return getRandomSampleBy(leaf, 'label', 'tag')
  }
  if (randomness < 0.80) {
    return getRandomSampleBy(leaf, 'lemma')
  }

  return Leaf.getAndConvertFromDb(leaf.realLeaf)
}
export async function shuffle(currentLeaf: PseudoLeaf, parentIsRoot = false): Promise<Leaf> {
  const leaf = await somethingLikeThis(currentLeaf, parentIsRoot)
  console.log('found a similar thing that is', leaf.word, 'from', leaf.id.id, 'size', leaf.treeSize)
  const lefts = leaf.lefts.map((pseudoLeaf: PseudoLeaf) => shuffle(pseudoLeaf, leaf.label === 'ROOT'))
  const rights = leaf.rights.map((pseudoLeaf: PseudoLeaf) => shuffle(pseudoLeaf, leaf.label === 'ROOT'))
  leaf.lefts = await Promise.all(lefts)
  leaf.rights = await Promise.all(rights)
  leaf.hydrated = true
  return leaf
}
export async function generatePhrase(): Promise<FirebaseFirestore.DocumentReference> {
    const words = await shuffle({ metaroot: true } as PseudoLeaf)
    let attemptsToWrite = 0
    while (true) {
        try {
            const newPhrase = phrasesRef.doc(getRandomAlphaNumeric())
            await newPhrase.create({
                words: words.toPhrase(),
                origin: Array.from(words.lnrSearch()).map((leaf) => leaf.id),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            })
            return newPhrase
        } catch (e) {
            console.error('could not create phrase', e)
            attemptsToWrite++
            if (attemptsToWrite > 3) {
                throw e
            }
        }
    }
}
