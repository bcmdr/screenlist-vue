// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkpVk9Cj4UebPBRsVk9_I6dB4GGxkdmDQ",
  authDomain: "screenlist-bcmdr.firebaseapp.com",
  projectId: "screenlist-bcmdr",
  storageBucket: "screenlist-bcmdr.appspot.com",
  messagingSenderId: "935128397813",
  appId: "1:935128397813:web:1621902c7a3355c5d452bc",
  measurementId: "G-WD1511B0LS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
