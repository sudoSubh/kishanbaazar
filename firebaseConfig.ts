
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"; 
import { getFirestore, doc, setDoc } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDNOdvsUUdpqIcX9gEC1Kq6vBHus8Kvcl4",
  authDomain: "krishibaazar-cd5ce.firebaseapp.com",
  projectId: "krishibaazar-cd5ce",
  storageBucket: "krishibaazar-cd5ce.appspot.com",
  messagingSenderId: "1017565881299",
  appId: "1:1017565881299:web:04ca3003d5c487b7f6c526",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);


const signUpUser = async (email: string, phone: string, name: string, password: string) => {
  try {
   
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: name,
      email: email, 
      phone: phone, 
    });

    console.log('User signed up and saved to Firestore:', user);
     
  } catch (error) {
    console.error('Error signing up:', error);
     
  }
};
 
const storage = getStorage(app);

 
export { auth, db, storage, signUpUser, app };
