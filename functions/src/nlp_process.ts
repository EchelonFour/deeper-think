import { Leaf } from "./leaf";

export interface TextSpan {
    content: string;
    beginOffset: number;
}

export interface Sentence {
    text: TextSpan;
}

export interface PartOfSpeech {
    tag: 'UNKNOWN' | 'ADJ' | 'ADP' | 'ADV' | 'CONJ' | 'DET' | 'NOUN' | 'NUM' | 'PRON' | 'PRT' | 'PUNCT' | 'VERB' | 'X' | 'AFFIX';
    aspect: 'ASPECT_UNKNOWN' | 'PERFECTIVE' | 'IMPERFECTIVE' | 'PROGRESSIVE';
    case: 'CASE_UNKNOWN' | 'ACCUSATIVE' | 'ADVERBIAL' | 'COMPLEMENTIVE' | 'DATIVE' | 'GENITIVE' | 'INSTRUMENTAL' | 'LOCATIVE' | 'NOMINATIVE' | 'OBLIQUE' | 'PARTITIVE' | 'PREPOSITIONAL' | 'REFLEXIVE_CASE' | 'RELATIVE_CASE' | 'VOCATIVE';
    form:  'FORM_UNKNOWN' | 'ADNOMIAL' | 'AUXILIARY' | 'COMPLEMENTIZER' | 'FINAL_ENDING' | 'GERUND' | 'REALIS' | 'IRREALIS' | 'SHORT' | 'LONG' | 'ORDER' | 'SPECIFIC';
    gender:  'GENDER_UNKNOWN' | 'FEMININE' | 'MASCULINE' | 'NEUTER';
    mood:  'MOOD_UNKNOWN' | 'CONDITIONAL_MOOD' | 'IMPERATIVE' | 'INDICATIVE' | 'INTERROGATIVE' | 'JUSSIVE' | 'SUBJUNCTIVE';
    number:  'NUMBER_UNKNOWN' | 'SINGULAR' | 'PLURAL' | 'DUAL';
    person:  'PERSON_UNKNOWN' | 'FIRST' | 'SECOND' | 'THIRD' | 'REFLEXIVE_PERSON';
    proper:  'PROPER_UNKNOWN' | 'PROPER' | 'NOT_PROPER';
    reciprocity:  'RECIPROCITY_UNKNOWN' | 'RECIPROCAL' | 'NON_RECIPROCAL';
    tense:  'TENSE_UNKNOWN' | 'CONDITIONAL_TENSE' | 'FUTURE' | 'PAST' | 'PRESENT' | 'IMPERFECT' | 'PLUPERFECT';
    voice:  'VOICE_UNKNOWN' | 'ACTIVE' | 'CAUSATIVE' | 'PASSIVE';
}

export interface DependencyEdge {
    headTokenIndex: number;
    label: 'UNKNOWN' | 'ABBREV' | 'ACOMP' | 'ADVCL' | 'ADVMOD' | 'AMOD' | 'APPOS' | 'ATTR' | 'AUX' | 'AUXPASS' | 'CC' | 'CCOMP' | 'CONJ' | 'CSUBJ' | 'CSUBJPASS' | 'DEP' | 'DET' | 'DISCOURSE' | 'DOBJ' | 'EXPL' | 'GOESWITH' | 'IOBJ' | 'MARK' | 'MWE' | 'MWV' | 'NEG' | 'NN' | 'NPADVMOD' | 'NSUBJ' | 'NSUBJPASS' | 'NUM' | 'NUMBER' | 'P' | 'PARATAXIS' | 'PARTMOD' | 'PCOMP' | 'POBJ' | 'POSS' | 'POSTNEG' | 'PRECOMP' | 'PRECONJ' | 'PREDET' | 'PREF' | 'PREP' | 'PRONL' | 'PRT' | 'PS' | 'QUANTMOD' | 'RCMOD' | 'RCMODREL' | 'RDROP' | 'REF' | 'REMNANT' | 'REPARANDUM' | 'ROOT' | 'SNUM' | 'SUFF' | 'TMOD' | 'TOPIC' | 'VMOD' | 'VOCATIVE' | 'XCOMP' | 'SUFFIX' | 'TITLE' | 'ADVPHMOD' | 'AUXCAUS' | 'AUXVV' | 'DTMOD' | 'FOREIGN' | 'KW' | 'LIST' | 'NOMC' | 'NOMCSUBJ' | 'NOMCSUBJPASS' | 'NUMC' | 'COP' | 'DISLOCATED' | 'ASP' | 'GMOD' | 'GOBJ' | 'INFMOD' | 'MES' | 'NCOMP';
}

export interface Token {
    text: TextSpan;
    partOfSpeech: PartOfSpeech;
    dependencyEdge: DependencyEdge;
    lemma: string;
}

export interface SourceSyntax {
    sentences: Sentence[];
    tokens: Token[];
    language: string;
}

export function NLPToTree(source: SourceSyntax): Leaf[] {
    const metaRoot = Leaf.newBlankMetaroot()
    //TODO link to nlp
    const leafs = source.tokens.map((token) => Leaf.fromToken(token))
    source.tokens.forEach((token, index) => {
        const parentId = token.dependencyEdge.headTokenIndex
        if (parentId === index) {
            metaRoot.addToLeft(leafs[index])
        }
        if (parentId > index) {
            leafs[parentId].addToLeft(leafs[index])
        }
        if (parentId < index) {
            leafs[parentId].addToRight(leafs[index])
        }
    })
    console.info(`Rebuilt sentence: ${metaRoot.toPhrase()}`)
    metaRoot.calculateTreeSize()
    leafs.push(metaRoot)

    return leafs
}