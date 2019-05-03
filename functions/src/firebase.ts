import * as firebase from 'firebase-admin'

firebase.initializeApp()

export default firebase
export const firestore = firebase.firestore()