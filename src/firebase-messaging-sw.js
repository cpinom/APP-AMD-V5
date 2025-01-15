importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyB1OTpgmDEf1eh65wNVY8m8ChoAwuRc8mc",
  authDomain: "inacap-amd-b0376.firebaseapp.com",
  databaseURL: "https://inacap-amd-b0376.firebaseio.com",
  projectId: "inacap-amd-b0376",
  storageBucket: "inacap-amd-b0376.appspot.com",
  messagingSenderId: "889560302292",
  appId: "1:889560302292:web:fddb665d617dc7472af141",
  measurementId: "G-YR9T4P1HLX"
});

const messaging = firebase.messaging();