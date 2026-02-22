import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// const firebaseConfig = {
//   apiKey: "AIzaSyDj1G8jIG-XOgUzhontgaGuVhQ4Z4z6x4A",
//   authDomain: "button-click-game-ff5d5.firebaseapp.com",
//   databaseURL:
//     "https://button-click-game-ff5d5-default-rtdb.europe-west1.firebasedatabase.app",
//   projectId: "button-click-game-ff5d5",
//   storageBucket: "button-click-game-ff5d5.firebasestorage.app",
//   messagingSenderId: "34258391425",
//   appId: "1:34258391425:web:5ff49c998ab7183350d880",
//   measurementId: "G-FYHR551Q0F",
// };

const firebaseConfig = {
  apiKey: "AIzaSyADbsOd99_XUc1gZwUfYGbl6kUEiujbWJM",
  authDomain: "dalashkre-inventory.firebaseapp.com",
  databaseURL: "https://dalashkre-inventory-default-rtdb.firebaseio.com",
  projectId: "dalashkre-inventory",
  storageBucket: "dalashkre-inventory.firebasestorage.app",
  messagingSenderId: "58463219112",
  appId: "1:58463219112:web:26a4a80f2b1a7646e4019d",
  measurementId: "G-XLLP6TQJY5",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
