import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

const firebaseConfig = {
  apiKey: "AIzaSyAWZP056lnaisTYZFTrwoCLshWVKthp_KE",
  authDomain: "reviewersapp-335ca.firebaseapp.com",
  projectId: "reviewersapp-335ca",
  storageBucket: "reviewersapp-335ca.firebasestorage.app",
  messagingSenderId: "570697517703",
  appId: "1:570697517703:web:c631771c4a941528098622"
};

// Inicialitza Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

// Inicialitza Storage
const storage = getStorage(app);

// Exporta les instàncies perquè les puguis utilitzar en altres fitxers
export { db, storage };