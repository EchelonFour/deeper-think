import { Leaf, PseudoLeaf } from './leaf'
import { firestore } from './firebase'
import randomNumber from './random';
// tslint:disable-next-line:no-implicit-dependencies
import { Query, DocumentSnapshot } from '@google-cloud/firestore';

const leafRef = firestore.collection('leafs')
async function getRandomSample(query: Query): Promise<DocumentSnapshot> {

    const random = randomNumber()
    let leaf = await query.where('random', '>', random).orderBy('random').limit(1).get()

    if (leaf.empty) {
        leaf = await query.where('random', '<=', random).orderBy('random').limit(1).get()
    }
    return leaf.docs[0]
}
export async function generate(): Promise<Leaf> {

    const metarootDb = await getRandomSample(leafRef.where('metaroot', '==', true))
    const metaroot = Leaf.convertFromDb(metarootDb)

    // this does all of them at once i think
    const loopFunction = async (pseudoLeaf: PseudoLeaf, i: number, side: (PseudoLeaf | Leaf)[]) => {
        //decide which elements to sample off
        const sample = await getRandomSample(leafRef.where('label', '==', pseudoLeaf.label))
        side[i] = Leaf.convertFromDb(sample)
    }
    await Promise.all([...metaroot.lefts.map(loopFunction), ...metaroot.rights.map(loopFunction)])

    return metaroot
}