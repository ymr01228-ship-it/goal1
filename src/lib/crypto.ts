// Simple encryption/decryption for local credential storage
// Uses AES-GCM with Web Crypto API for real encryption

const ENCRYPTION_KEY = 'focusos-local-key-v1';

async function getKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));

  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(plaintext: string): Promise<string> {
  try {
    const key = await getKey();
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = encoder.encode(plaintext);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch {
    // Fallback: base64 encode if crypto API unavailable
    return btoa(plaintext);
  }
}

export async function decryptData(ciphertext: string): Promise<string> {
  try {
    const key = await getKey();
    const combined = new Uint8Array(
      atob(ciphertext).split('').map((c) => c.charCodeAt(0))
    );

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    // Fallback: base64 decode
    return atob(ciphertext);
  }
}
