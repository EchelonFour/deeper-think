import { PartOfSpeech, DependencyEdge, Token } from "./nlp_process"
import * as _ from 'lodash'
import randomNumber from "./random"
import { firestore } from './firebase'
// tslint:disable-next-line:no-implicit-dependencies
import { DocumentSnapshot, DocumentReference } from "@google-cloud/firestore"

const leafRef = firestore.collection('leafs')
export interface WordData extends PartOfSpeech {
    label: DependencyEdge['label']
    metaroot: boolean
    treeSize: number
    lemma: string
    word: string
}
export interface ILeaf extends WordData {
    lefts: WordData[]
    rights: WordData[]
    parent: WordData
}

export interface PseudoLeaf extends WordData {
    realLeaf: DocumentReference
}
export interface DBLeaf extends ILeaf {
    lefts: PseudoLeaf[]
    rights: PseudoLeaf[]
    parent: PseudoLeaf,
    random: number
}
export class Leaf implements ILeaf {
    id: DocumentReference = null
    metaroot: ILeaf['metaroot'] = null
    label: ILeaf['label'] = null
    treeSize: ILeaf['treeSize'] = null
    lemma: ILeaf['lemma'] = null
    word: ILeaf['word'] = null
    lefts: (Leaf | PseudoLeaf)[] = []
    rights: (Leaf | PseudoLeaf)[] = []
    parent: Leaf | PseudoLeaf = null
    tag: ILeaf['tag'] = null
    aspect: ILeaf['aspect'] = null
    case: ILeaf['case'] = null
    form: ILeaf['form'] = null
    gender: ILeaf['gender'] = null
    mood: ILeaf['mood'] = null
    number: ILeaf['number'] = null
    person: ILeaf['person'] = null
    proper: ILeaf['proper'] = null
    reciprocity: ILeaf['reciprocity'] = null
    tense: ILeaf['tense'] = null
    voice: ILeaf['voice'] = null

    hydrated: boolean = false

    private constructor() {

    }
    static fromToken(token: Token): Leaf {
        const leaf = new Leaf()
        leaf.label = token.dependencyEdge.label
        leaf.lemma = token.lemma
        leaf.word = token.text.content.toLowerCase()
        leaf.tag = token.partOfSpeech.tag
        leaf.aspect = token.partOfSpeech.aspect
        leaf.case = token.partOfSpeech.case
        leaf.form = token.partOfSpeech.form
        leaf.gender = token.partOfSpeech.gender
        leaf.mood = token.partOfSpeech.mood
        leaf.number = token.partOfSpeech.number
        leaf.person = token.partOfSpeech.person
        leaf.proper = token.partOfSpeech.proper
        leaf.reciprocity = token.partOfSpeech.reciprocity
        leaf.tense = token.partOfSpeech.tense
        leaf.voice = token.partOfSpeech.voice
        leaf.id = leafRef.doc()
        leaf.metaroot = false
        leaf.hydrated = true //no children yet i guess, but still counts
        return leaf
    }

    static newBlankMetaroot() {
        const metaroot = new Leaf()
        metaroot.metaroot = true
        metaroot.hydrated = true
        metaroot.id = leafRef.doc()
        return metaroot
    }

    static convertFromDb(snapshot: DocumentSnapshot): Leaf{
        const dbLeaf = snapshot.data() as DBLeaf
        const leaf = new Leaf()
        Object.keys(this).forEach((key) => {
            if (key in dbLeaf) {
                this[key] = dbLeaf[key]
            }
        })
        leaf.id = snapshot.ref
        leaf.hydrated = false
        return leaf
    }
    static async getAndConvertFromDb(reference: DocumentReference): Promise<Leaf> {
        const snapshot = await reference.get()
        return this.convertFromDb(snapshot)
    }

    addToRight(leaf: Leaf): void {
        if (!this.hydrated) {
            throw new Error('cant add real leaf to unhydrated leaf')
        }
        leaf.parent = this
        this.rights.push(leaf)
    }
    addToLeft(leaf: Leaf): void {
        leaf.parent = this
        this.lefts.push(leaf)
    }
    public calculateTreeSize(): number {
        if (!this.hydrated) {
            throw new Error('cant calculate tree size unhydrated leaf')
        }
        let count = 1
        for (const leaf of <Leaf[]>this.lefts) {
            count += leaf.calculateTreeSize()
        }
        for (const leaf of <Leaf[]>this.rights) {
            count += leaf.calculateTreeSize()
        }
        this.treeSize = count
        return count
    }

    public toPhrase(): string {
        let phrase = ''
        
        let previousLeaf: Leaf = null
        for (const leaf of this.lnrSearch()) {
            if (!leaf.word) {
                continue
            }
            let word = leaf.word
            if (word === 'i') {
                word = 'I'
            } else if (word === 'n\'t') {
                word = 'not'
            } else if (word === '\'m') {
                word = 'am'
            }
            if (previousLeaf === null || previousLeaf.word in ['.', '?', '!']) {
                word = _.capitalize(word)
            }
            if (leaf.tag !== 'PUNCT' && !word.startsWith("'") && previousLeaf !== null) {
                phrase += ' '
            }
            phrase += word
            previousLeaf = leaf
        }
        return phrase
    }

    public* lnrSearch(): IterableIterator<Leaf> {
        if (!this.hydrated) {
            throw new Error('cant lnr search unhydrated leaf')
        }
        for (const leaf of <Leaf[]>this.lefts) {
            yield* leaf.lnrSearch()
        }
        yield this
        for (const leaf of <Leaf[]>this.rights) {
            yield* leaf.lnrSearch()
        }
    }

    public* children() {
        yield* this.lefts
        yield* this.rights
    }

    public toDBLeaf(): DBLeaf {
        return Object.assign(this.toWordData(), {
            lefts: this.lefts.map((leaf) => leaf instanceof Leaf ? leaf.toPseudoLeaf() : leaf),
            rights: this.rights.map((leaf) => leaf instanceof Leaf ? leaf.toPseudoLeaf() : leaf),
            parent: this.parent instanceof Leaf ? this.parent.toPseudoLeaf() : this.parent,
            random: randomNumber()
        })
    }
    public toPseudoLeaf(): PseudoLeaf {
        return Object.assign(this.toWordData(), {
            realLeaf: this.id
        })
    }
    private toWordData(): WordData {
        return {
            label: this.label,
            treeSize: this.treeSize,
            lemma: this.lemma,
            word: this.word,
            tag: this.tag,
            aspect: this.aspect,
            case: this.case,
            form: this.form,
            gender: this.gender,
            mood: this.mood,
            number: this.number,
            person: this.person,
            proper: this.proper,
            reciprocity: this.reciprocity,
            tense: this.tense,
            voice: this.voice,
            metaroot: this.metaroot,
        }
    }
}