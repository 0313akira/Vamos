// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import {getFirestore} from"firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDh45O1okFyEk_Jp10o4HXOE5ORg0n8OHs",
  authDomain: "bamosu-2c03e.firebaseapp.com",
  projectId: "bamosu-2c03e",
  storageBucket: "bamosu-2c03e.firebasestorage.app",
  messagingSenderId: "543975354281",
  appId: "1:543975354281:web:e559cad72b9f6acbd29eb8",
  measurementId: "G-WTLZXMDS9F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);