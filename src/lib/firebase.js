import { initializeApp } from 'firebase/app'
import { GoogleAuthProvider, getAuth, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth'
import { getFirestore, query, getDocs, collection, where, addDoc, serverTimestamp} from 'firebase/firestore'
import { enableIndexedDbPersistence } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
//gets the firestore database from firebase
const db = getFirestore(app);
const storage = getStorage(app);

enableIndexedDbPersistence(db)
  .catch((err) => {
      if (err.code === 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a a time.
          // ...
      } else if (err.code === 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence
          // ...
      }
  });

//sign in with google
const googleProvider = new GoogleAuthProvider();
const signInWithGoogle = async () => {
    try {
        const res = await signInWithPopup(auth, googleProvider);
        const user = res.user;
        const q = query(collection(db, "users"), where("uid", "==", user.uid))
        const docs = await getDocs(q);
        if (docs.length === 0) {
            await addDoc(collection(db, "users"), {
                uid: user.uid,
                name: user.displayName,
                authProvider: "google",
                email: user.email,
            })
        }
    } catch (err) {
        console.error(err)
        alert(err)
    }
}
//login with email and password
const logInWithEmailAndPassword = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
        alert(err.message)
        console.error(err);
    }
}
//register with email and password
const registerWithEmailAndPassword = async (name, lastName, email, password) => {
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
        const { photoURL } = auth.currentUser;
        await addDoc(collection(db, "users"), {
            uid: user.uid,
            name,
            lastName,
            authProvider: "local",
            email,
            photoURL
        })
    } catch (err) {
        console.error(err)
        alert(err.message)
    }
}
//send password reset
const sendPasswordReset = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        alert('Password reset link sent!')
    } catch (err) {
        console.error(err);
    }
}
//logout
const logout = () => {
    signOut(auth);
}
//add document data
//needs changes to be more dynamic
const addDocs = async (title, desc, image) => {
    try {
        await addDoc(collection(db, "special-products"), {
            title: title,
            desc: desc,
            image: image,
            created: serverTimestamp(),
            
        })
    } catch (error) {
        console.error(error)
    }
}

export {
    auth, db, storage, signInWithEmailAndPassword, logInWithEmailAndPassword, registerWithEmailAndPassword, signInWithGoogle, sendPasswordReset, logout, addDocs
}