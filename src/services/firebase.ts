import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
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
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth-only Google provider. Workspace scopes stay separate from authentication consent.
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: 'select_account' });
export const googleWorkspaceProvider = new GoogleAuthProvider();

export type GoogleAuthFailureCode =
  | 'cancelled'
  | 'popup-blocked'
  | 'unauthorized-domain'
  | 'configuration'
  | 'network'
  | 'invalid-credential'
  | 'account-exists'
  | 'unknown';

export class GoogleAuthError extends Error {
  constructor(public readonly reason: GoogleAuthFailureCode, cause?: unknown) {
    super(reason);
    this.name = 'GoogleAuthError';
    Object.assign(this, { cause });
  }
}

const classifyGoogleAuthError = (error: unknown): GoogleAuthError => {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (import.meta.env.DEV) console.warn('[v0] Google authentication failed:', code || 'unknown');
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return new GoogleAuthError('cancelled', error);
  if (code === 'auth/popup-blocked') return new GoogleAuthError('popup-blocked', error);
  if (code === 'auth/unauthorized-domain') return new GoogleAuthError('unauthorized-domain', error);
  if (code === 'auth/operation-not-supported-in-this-environment' || code === 'auth/invalid-api-key' || code === 'auth/invalid-oauth-client-id') return new GoogleAuthError('configuration', error);
  if (code === 'auth/network-request-failed') return new GoogleAuthError('network', error);
  if (code === 'auth/account-exists-with-different-credential' || code === 'auth/credential-already-in-use') return new GoogleAuthError('account-exists', error);
  if (code === 'auth/invalid-credential') return new GoogleAuthError('invalid-credential', error);
  return new GoogleAuthError('unknown', error);
};

export const googleAuthSignIn = async (): Promise<User> => {
  try {
    // First, check for any pending redirect result from popup-blocked scenario
    try {
      const redirectResult = await getRedirectResult(auth);
      if (redirectResult?.user) return redirectResult.user;
    } catch (e) {
      // Redirect result check failed, continue with popup
    }

    // Try popup first
    const result = await signInWithPopup(auth, googleAuthProvider);
    return result.user;
  } catch (error) {
    const classified = classifyGoogleAuthError(error);
    // If popup is blocked, use redirect as fallback
    if (classified.reason === 'popup-blocked') {
      await signInWithRedirect(auth, googleAuthProvider);
      throw new GoogleAuthError('popup-blocked', error);
    }
    throw classified;
  }
};

export const resolveGoogleRedirect = async (): Promise<User | null> => {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (error) {
    throw classifyGoogleAuthError(error);
  }
};

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
  googleWorkspaceProvider.addScope(scope);
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

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleWorkspaceProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve access token from Google Sign-In credential.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const emailSignIn = async (email: string, password: string): Promise<User> => {
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  return result.user;
};

export const emailSignUp = async (email: string, password: string): Promise<User> => {
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
  return result.user;
};

export const sendVerificationEmail = (user: User) => sendEmailVerification(user);

export const requestPasswordReset = (email: string) =>
  sendPasswordResetEmail(auth, email.trim());

export const logout = async () => {
  cachedAccessToken = null;
  await signOut(auth);
};

export const googleLogout = logout;
export { onAuthStateChanged };
