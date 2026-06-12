import { initializeApp, getApps } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyD-rDWPXIz-OCGavABzDr3ptZ_xnRFJ5nQ",
  authDomain: "noteflow-top5detodo.firebaseapp.com",
  projectId: "noteflow-top5detodo",
  storageBucket: "noteflow-top5detodo.firebasestorage.app",
  messagingSenderId: "286244852807",
  appId: "1:286244852807:web:f8ff6d918ec23f223f0d62"
};

const apps = getApps();
const app = apps.length === 0 ? initializeApp(firebaseConfig) : apps[0];

const auth = apps.length === 0
  ? initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    })
  : getAuth(app);

const db = getFirestore(app);

export { app, auth, db };