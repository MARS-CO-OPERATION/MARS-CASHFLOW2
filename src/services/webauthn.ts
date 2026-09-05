import { BiometricCredentialEntity } from '../types';

/**
 * WebAuthn Biometric Service for MARS Cashflow
 * Provides native fingerprint (Touch ID / Android BiometricPrompt) and facial recognition (Face ID)
 * authentication using the W3C Web Authentication standard.
 */

export function bufferToBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function base64UrlToBuffer(base64url: string): ArrayBuffer {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Identifies the mobile/desktop device biometric sensor type for friendly UI labels
 */
export function getDeviceBiometricLabel(): string {
  if (typeof navigator === 'undefined') return 'Mobile Biometrics';
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/.test(ua)) {
    return 'Apple Face ID / Touch ID';
  }
  if (/Android/.test(ua)) {
    if (/Pixel/i.test(ua)) return 'Google Pixel Biometric';
    if (/Samsung|SM-/i.test(ua)) return 'Samsung Biometrics';
    return 'Android Fingerprint / Face';
  }
  if (/Macintosh/i.test(ua)) {
    return 'Mac Touch ID';
  }
  if (/Windows/i.test(ua)) {
    return 'Windows Hello';
  }
  return 'Platform Biometric Sensor';
}

/**
 * Checks if the browser runtime supports WebAuthn APIs
 */
export function isWebAuthnSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    window.PublicKeyCredential &&
    navigator.credentials &&
    typeof navigator.credentials.create === 'function' &&
    typeof navigator.credentials.get === 'function'
  );
}

/**
 * Checks if the physical device has a built-in platform authenticator (fingerprint scanner, Face ID, etc.)
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  try {
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return !!available;
    }
  } catch (err) {
    console.warn('Error checking platform authenticator availability:', err);
  }
  return false;
}

const STORAGE_KEY = 'mars_biometric_credentials';

export function getLocalBiometricCredentials(): BiometricCredentialEntity[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalBiometricCredential(cred: BiometricCredentialEntity): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalBiometricCredentials();
    // Keep list clean, replace if same ID or same user
    const filtered = existing.filter((c) => c.id !== cred.id && c.userId !== cred.userId);
    filtered.unshift(cred);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('Failed to save biometric credential to localStorage:', err);
  }
}

export function removeLocalBiometricCredential(credId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalBiometricCredentials();
    const updated = existing.filter((c) => c.id !== credId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to remove biometric credential from localStorage:', err);
  }
}

export function getPreferredBiometricCredential(userEmail?: string): BiometricCredentialEntity | null {
  const list = getLocalBiometricCredentials();
  if (list.length === 0) return null;
  if (userEmail) {
    const match = list.find((c) => c.userEmail.toLowerCase() === userEmail.toLowerCase());
    if (match) return match;
  }
  return list[0] || null;
}

function parseWebAuthnError(err: any, flow: 'register' | 'authenticate'): {
  success: false;
  error: string;
  inIframe?: boolean;
} {
  const name = err?.name || '';
  const message = err?.message || '';
  const inIframe = typeof window !== 'undefined' && window.self !== window.top;

  if (name === 'NotAllowedError') {
    return {
      success: false,
      error: 'Biometric verification was canceled or timed out. Tap to try again.',
      inIframe,
    };
  }

  if (name === 'SecurityError') {
    if (inIframe) {
      return {
        success: false,
        error: 'Biometric sensor access is restricted inside an embedded preview frame. Open the application in a new browser tab to use native fingerprint or Face ID.',
        inIframe: true,
      };
    }
    return {
      success: false,
      error: 'Security constraint: WebAuthn requires a secure origin (HTTPS or localhost).',
    };
  }

  if (name === 'NotSupportedError') {
    return {
      success: false,
      error: 'This device or browser does not support on-device biometric passkey registration.',
    };
  }

  if (name === 'InvalidStateError') {
    return {
      success: false,
      error: flow === 'register'
        ? 'This biometric sensor is already enrolled for this account.'
        : 'The requested biometric credential could not be verified on this device.',
    };
  }

  if (name === 'AbortError') {
    return {
      success: false,
      error: 'Biometric verification was interrupted. Please try again.',
    };
  }

  return {
    success: false,
    error: message || 'Biometric authentication failed. Please try again or use your password.',
    inIframe,
  };
}

/**
 * Registers the current device's biometric sensor (fingerprint, Face ID, or Windows Hello)
 * creating a cryptographic passkey pair locked to the device's Secure Enclave/TPM.
 */
export async function registerBiometricCredential(params: {
  userId: string;
  email: string;
  displayName: string;
}): Promise<{
  success: boolean;
  credential?: BiometricCredentialEntity;
  error?: string;
  inIframe?: boolean;
}> {
  if (!isWebAuthnSupported()) {
    return {
      success: false,
      error: 'Web Authentication (WebAuthn) is not supported in this browser.',
    };
  }

  const hasPlatformAuth = await isPlatformAuthenticatorAvailable();
  if (!hasPlatformAuth) {
    return {
      success: false,
      error: 'No biometric hardware (fingerprint sensor or facial recognition) was detected on this device.',
    };
  }

  try {
    const challenge = window.crypto.getRandomValues(new Uint8Array(32));
    const userIdBytes = new TextEncoder().encode(params.userId);

    const hostname = window.location.hostname;
    const rpConfig: PublicKeyCredentialRpEntity = {
      name: 'MARS Cashflow',
    };
    if (hostname && hostname !== 'localhost' && !/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      rpConfig.id = hostname;
    }

    const creationOptions: CredentialCreationOptions = {
      publicKey: {
        challenge: challenge.buffer,
        rp: rpConfig,
        user: {
          id: userIdBytes.buffer,
          name: params.email,
          displayName: params.displayName || params.email,
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },   // ES256 (NIST P-256)
          { type: 'public-key', alg: -257 }, // RS256 (RSA 2048)
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // Enforce on-device hardware biometric
          userVerification: 'required',        // Require fingerprint or facial recognition
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      },
    };

    const credential = (await navigator.credentials.create(
      creationOptions
    )) as PublicKeyCredential | null;

    if (!credential) {
      return {
        success: false,
        error: 'Biometric registration failed: no credential returned by the hardware authenticator.',
      };
    }

    const credId = bufferToBase64Url(credential.rawId);
    const rawIdStr = bufferToBase64Url(credential.rawId);
    const deviceLabel = getDeviceBiometricLabel();

    const newCred: BiometricCredentialEntity = {
      id: credId,
      rawId: rawIdStr,
      userId: params.userId,
      userEmail: params.email,
      displayName: params.displayName || params.email,
      deviceLabel,
      transports: ['internal'],
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
    };

    saveLocalBiometricCredential(newCred);

    return {
      success: true,
      credential: newCred,
    };
  } catch (err: any) {
    return parseWebAuthnError(err, 'register');
  }
}

/**
 * Prompts user for biometric verification (fingerprint or face scan) on mobile or laptop.
 */
export async function authenticateBiometricCredential(
  preferredCredentialId?: string
): Promise<{
  success: boolean;
  credentialId?: string;
  matchedCredential?: BiometricCredentialEntity;
  error?: string;
  inIframe?: boolean;
}> {
  if (!isWebAuthnSupported()) {
    return {
      success: false,
      error: 'Web Authentication is not supported in this browser.',
    };
  }

  const localCreds = getLocalBiometricCredentials();
  if (localCreds.length === 0 && !preferredCredentialId) {
    return {
      success: false,
      error: 'No biometric credentials enrolled on this device yet. Sign in once with your password or Google to register your fingerprint or Face ID.',
    };
  }

  try {
    const challenge = window.crypto.getRandomValues(new Uint8Array(32));
    const hostname = window.location.hostname;

    let allowList: PublicKeyCredentialDescriptor[] = [];
    if (preferredCredentialId) {
      allowList.push({
        id: base64UrlToBuffer(preferredCredentialId),
        type: 'public-key',
        transports: ['internal'],
      });
    } else {
      allowList = localCreds.map((c) => ({
        id: base64UrlToBuffer(c.id),
        type: 'public-key',
        transports: ['internal'],
      }));
    }

    const requestOptions: CredentialRequestOptions = {
      publicKey: {
        challenge: challenge.buffer,
        timeout: 60000,
        userVerification: 'required',
        ...(hostname && hostname !== 'localhost' && !/^\d+\.\d+\.\d+\.\d+$/.test(hostname)
          ? { rpId: hostname }
          : {}),
        ...(allowList.length > 0 ? { allowCredentials: allowList } : {}),
      },
    };

    const assertion = (await navigator.credentials.get(
      requestOptions
    )) as PublicKeyCredential | null;

    if (!assertion) {
      return {
        success: false,
        error: 'Biometric verification did not return an authentication assertion.',
      };
    }

    const assertionId = bufferToBase64Url(assertion.rawId);
    const matched =
      localCreds.find((c) => c.id === assertionId || c.rawId === assertionId) ||
      (preferredCredentialId ? localCreds.find((c) => c.id === preferredCredentialId) : null) ||
      localCreds[0];

    if (matched) {
      matched.lastUsedAt = Date.now();
      saveLocalBiometricCredential(matched);
    }

    return {
      success: true,
      credentialId: assertionId,
      matchedCredential: matched,
    };
  } catch (err: any) {
    return parseWebAuthnError(err, 'authenticate');
  }
}
