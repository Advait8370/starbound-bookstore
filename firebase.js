import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

import {
  getAnalytics,
  logEvent
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyAKj91wzdGYGI_kbluKbTXwtd3BZIaIXoE",
    authDomain: "starbound-bookstore.firebaseapp.com",
    projectId: "starbound-bookstore",
    storageBucket: "starbound-bookstore.firebasestorage.app",
    messagingSenderId: "111167679304",
    appId: "1:111167679304:web:fb7d3bda97c32272b7e17d",
    measurementId: "G-HX9310PSFG"
  };

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export {
  analytics,
  logEvent,
  auth,
  provider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
};