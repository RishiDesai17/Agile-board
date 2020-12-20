import firebase from "firebase";
import { firebase as firebaseConfig } from "../config.json";

const firebaseApp = firebase.initializeApp({
    ...firebaseConfig
});

const db = firebaseApp.firestore();

db.enablePersistence().catch(err => {
    console.log(err)
});

export { db }