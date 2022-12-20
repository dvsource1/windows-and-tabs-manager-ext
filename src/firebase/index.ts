// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBoYI4pagPq699H3xn8K4-X95-SDwhixYI",
  authDomain: "fsw-test-api.firebaseapp.com",
  projectId: "fsw-test-api",
  storageBucket: "fsw-test-api.appspot.com",
  messagingSenderId: "931941394630",
  appId: "1:931941394630:web:3d13a207c35e97305bcfc7",
  measurementId: "G-BP4M216E5T",
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const initFirebase = (): FirebaseApp => {
  return initializeApp(firebaseConfig);
};
