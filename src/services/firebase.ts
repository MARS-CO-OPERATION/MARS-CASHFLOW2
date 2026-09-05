import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  getDocFromServer,
} from 'firebase/firestore';
import defaultAppletConfig from '../../firebase-applet-config.json';

export interface FirebaseAppConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
}

// Hierarchical configuration: Environment variables take top precedence (essential for Vercel/production),
// falling back to firebase-applet-config.json for local/container defaults.
export const getActiveFirebaseConfig = (): FirebaseAppConfig => {
  const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : ({} as Record<string, string>);

  const envApiKey = env.VITE_FIREBASE_API_KEY;
  const envProjectId = env.VITE_FIREBASE_PROJECT_ID;

  if (envApiKey && envProjectId) {
    return {
      apiKey: envApiKey,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.firebasestorage.app`,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: env.VITE_FIREBASE_APP_ID || '',
      measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || '',
    };
  }

  const fallback = defaultAppletConfig as Partial<FirebaseAppConfig>;
  return {
    apiKey: fallback.apiKey || '',
    authDomain: fallback.authDomain || '',
    projectId: fallback.projectId || '',
    storageBucket: fallback.storageBucket || '',
    messagingSenderId: fallback.messagingSenderId || '',
    appId: fallback.appId || '',
    measurementId: fallback.measurementId || '',
  };
};

export const getFirebaseConfigStatus = () => {
  const config = getActiveFirebaseConfig();
  const missing: string[] = [];
  if (!config.apiKey) missing.push('VITE_FIREBASE_API_KEY');
  if (!config.authDomain) missing.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!config.projectId) missing.push('VITE_FIREBASE_PROJECT_ID');
  if (!config.appId) missing.push('VITE_FIREBASE_APP_ID');

  return {
    isConfigured: missing.length === 0,
    projectId: config.projectId,
    authDomain: config.authDomain,
    missingKeys: missing,
  };
};

const activeConfig = getActiveFirebaseConfig();

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(activeConfig) : getApp();
export const auth = getAuth(app);

const targetDatabaseId =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FIREBASE_DATABASE_ID) ||
  (defaultAppletConfig as any).firestoreDatabaseId ||
  undefined;

export const db = targetDatabaseId && targetDatabaseId !== '(default)'
  ? getFirestore(app, targetDatabaseId)
  : getFirestore(app);

// Test connection to Firestore on initial bootstrap as required by Firebase integration guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

if (typeof window !== 'undefined') {
  testConnection();
}

// Map Firebase error codes to secure, human-actionable messages without exposing internals
export const getAuthErrorMessage = (
  err: any,
  flow: 'login' | 'register' | 'google' | 'reset' = 'login'
): string => {
  const code = err?.code || '';
  const rawMsg = err?.message || '';

  switch (code) {
    case 'auth/operation-not-allowed':
      if (flow === 'google') {
        return 'Google Sign-In is not enabled for this project. Please enable Google in Firebase Console > Authentication > Sign-in method.';
      }
      return 'Email/Password registration is not enabled in this Firebase project. Please enable Email/Password in Firebase Console > Authentication > Sign-in method.';

    case 'auth/unauthorized-domain': {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'your deployment domain';
      return `Domain "${currentHost}" is not authorized for OAuth sign-in. Add this domain in Firebase Console > Authentication > Settings > Authorized domains.`;
    }

    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead or reset your password.';

    case 'auth/invalid-email':
      return 'The email address format is invalid. Please enter a valid email address.';

    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 8 characters including letters and numbers.';

    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials and try again.';

    case 'auth/too-many-requests':
      return 'Access temporarily locked due to multiple failed login attempts. Please wait a few minutes or reset your password.';

    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connection.';

    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Google sign-in was closed before completion.';

    case 'auth/popup-blocked':
      return 'The Google sign-in window was blocked by your browser. Please allow popups for this site.';

    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email using a different sign-in method.';

    default:
      if (rawMsg && !rawMsg.includes('API key') && !rawMsg.includes('token') && !rawMsg.includes('secret')) {
        return rawMsg;
      }
      return flow === 'register'
        ? 'Registration could not be completed. Please check your information and try again.'
        : 'Authentication failed. Please verify your credentials and try again.';
  }
};

// Keep app authentication separate from Google Workspace authorization.
// Requesting Workspace scopes during account sign-in can trigger a second consent
// flow and makes the Firebase popup operation prone to cancellation/race errors.
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

export const workspaceAuthProvider = new GoogleAuthProvider();

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/contacts',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/documents.readonly',
  'https://www.googleapis.com/auth/presentations',
  'https://www.googleapis.com/auth/presentations.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.body.readonly',
  'https://www.googleapis.com/auth/forms.responses.readonly',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/tasks.readonly',
  'openid',
  'email',
  'profile',
];

WORKSPACE_SCOPES.forEach((scope) => {
  workspaceAuthProvider.addScope(scope);
});

// Cache the access token in memory (never localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const getCachedAccessToken = (): string | null => cachedAccessToken;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Try getting token if available or notify failure
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

const signInWithGoogleProvider = async (provider: GoogleAuthProvider): Promise<{ user: User; accessToken: string }> => {
  if (isSigningIn) {
    const error = new Error('A Google sign-in request is already in progress.');
    error.name = 'auth/cancelled-popup-request';
    throw error;
  }

  isSigningIn = true;
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || '';
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

/**
 * Configures Firebase Auth session persistence based on user preference:
 * - browserLocalPersistence: User stays signed in across browser restarts / tab closures ('Remember me' enabled).
 * - browserSessionPersistence: State is cleared when the tab/window is closed ('Remember me' disabled).
 */
export const setAuthPersistencePreference = async (rememberMe: boolean = true): Promise<void> => {
  try {
    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistence);
  } catch (err) {
    console.warn('Failed to configure Firebase Auth persistence:', err);
  }
};

// Immediately prime Firebase Auth with the saved persistence preference (defaults to true)
if (typeof window !== 'undefined') {
  try {
    const savedPref = localStorage.getItem('mars_remember_me');
    const isRemember = savedPref === null ? true : savedPref === 'true';
    setAuthPersistencePreference(isRemember).catch(() => {});
  } catch {
    // ignore
  }
}

export const googleSignIn = async (rememberMe: boolean = true): Promise<{ user: User; accessToken: string }> => {
  await setAuthPersistencePreference(rememberMe);
  return signInWithGoogleProvider(googleAuthProvider);
};

export const googleWorkspaceSignIn = async (): Promise<{ user: User; accessToken: string }> =>
  signInWithGoogleProvider(workspaceAuthProvider);

export const emailSignIn = async (email: string, password: string, rememberMe: boolean = true): Promise<User> => {
  await setAuthPersistencePreference(rememberMe);
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  return result.user;
};

export const emailSignUp = async (email: string, password: string, rememberMe: boolean = true): Promise<User> => {
  await setAuthPersistencePreference(rememberMe);
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
  return result.user;
};

export const requestPasswordReset = (email: string) =>
  sendPasswordResetEmail(auth, email.trim());

export const logout = async () => {
  cachedAccessToken = null;
  await signOut(auth);
};

export const googleLogout = logout;
export { onAuthStateChanged, browserLocalPersistence, browserSessionPersistence };
