const encoder = new TextEncoder();
const decoder = new TextDecoder();
const PBKDF2_ITERATIONS = 210_000;

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export interface EncryptedCardCredential {
  url: string;
  password: string;
}

function createPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const random = crypto.getRandomValues(new Uint8Array(16));
  const compact = Array.from(random, (value) => alphabet[value & 31]).join('');
  return compact.match(/.{1,4}/g)!.join('-');
}

async function deriveKey(password: string, salt: Uint8Array, usage: KeyUsage): Promise<CryptoKey> {
  const passwordKey = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITERATIONS },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    [usage],
  );
}

export async function createEncryptedCardLink(origin: string, data: unknown): Promise<EncryptedCardCredential> {
  if (!crypto?.subtle) throw new Error('This browser does not support Web Crypto.');

  const password = createPassword();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt, 'encrypt');
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(data))),
  );
  const payload = new Uint8Array(salt.length + iv.length + encrypted.length);
  payload.set(salt);
  payload.set(iv, salt.length);
  payload.set(encrypted, salt.length + iv.length);

  return { url: `${origin}/card?data=${toBase64Url(payload)}`, password };
}

export async function decryptCardLink(location: Location, password: string): Promise<unknown> {
  if (!crypto?.subtle) throw new Error('This browser does not support Web Crypto.');

  const payloadValue = new URLSearchParams(location.search).get('data');
  if (!payloadValue) throw new Error('This ID-card link is incomplete.');
  if (!password.trim()) throw new Error('Enter the password supplied with this ID-card link.');

  const payload = fromBase64Url(payloadValue);
  if (payload.length < 45) throw new Error('This ID-card link is malformed.');

  try {
    const key = await deriveKey(password.trim().toUpperCase(), payload.slice(0, 16), 'decrypt');
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: payload.slice(16, 28) },
      key,
      payload.slice(28),
    );
    return JSON.parse(decoder.decode(plain));
  } catch {
    throw new Error('Incorrect password, or this ID-card link has been modified.');
  }
}
