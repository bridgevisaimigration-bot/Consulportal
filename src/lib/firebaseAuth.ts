import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut as fbSignOut, onAuthStateChanged, User } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSUr4j9O-O46UV9OxUMD64Z2RNlEg7BFU",
  authDomain: "consul-c2705.firebaseapp.com",
  projectId: "consul-c2705",
  storageBucket: "consul-c2705.firebasestorage.app",
  messagingSenderId: "1042243966800",
  appId: "1:1042243966800:web:8b7675bc111dcdc50b3e55",
  measurementId: "G-22RMYGMK96"
};

let app: any;
let auth: any;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
} catch (err) {
  console.warn("Firebase Initialization bypassed or blocked (running in sandbox offline-first model):", err);
  // Create a resilient mock auth to satisfy dependencies without crashing
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback: any) => {
      callback(null);
      return () => {};
    }
  };
}

export { auth };

// Initialize Analytics safely
export let analytics: any = null;
if (app) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.warn("Firebase Analytics is not supported in this environment:", err);
  });
}

const provider = new GoogleAuthProvider();
// Add Gmail send scope
provider.addScope("https://www.googleapis.com/auth/gmail.send");
// Prompt select_account to make switching accounts easy
provider.setCustomParameters({
  prompt: "select_account"
});

export const signInWithGmail = async (): Promise<{ user: User; accessToken: string }> => {
  if (!auth || typeof auth.signInWithPopup !== "function" && !auth.app) {
    throw {
      code: "auth/unauthorized-domain",
      message: "Firebase domain authorization or connection is restricted in this sandboxed frame. Please use the Simulator Mode to log in instantly."
    };
  }
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential || !credential.accessToken) {
      throw new Error("Failed to retrieve Google OAuth access token.");
    }
    return {
      user: result.user,
      accessToken: credential.accessToken
    };
  } catch (error: any) {
    console.warn("Firebase Sign-In Error (handled):", error?.message || error);
    throw error;
  }
};

export const signOutGmail = async () => {
  if (auth && typeof fbSignOut === "function" && auth.app) {
    await fbSignOut(auth);
  }
};
