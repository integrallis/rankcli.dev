// AES-256-GCM encrypt/decrypt for user-supplied BYOK AI credentials at
// rest. Uses a dedicated secret (AI_KEY_ENCRYPTION_SECRET) so a leak of the
// Supabase service role key alone doesn't also expose every stored user
// API key - the encryption secret is a separate credential entirely.

async function deriveAesKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.digest('SHA-256', encoder.encode(secret));
  return crypto.subtle.importKey('raw', keyMaterial, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

// Output layout (all base64 of the raw bytes concatenated): 12-byte IV +
// ciphertext (which already includes the GCM auth tag, per WebCrypto).
export async function encryptSecret(plaintext: string, secret: string): Promise<string> {
  const key = await deriveAesKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(plaintext));

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

export async function decryptSecret(encoded: string, secret: string): Promise<string> {
  const key = await deriveAesKey(secret);
  const combined = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new TextDecoder().decode(plaintext);
}
