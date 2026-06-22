const encoder = new TextEncoder();
const decoder = new TextDecoder();

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

export async function createEncryptedCardLink(origin: string, data: unknown): Promise<string> {
  if (!crypto?.subtle) throw new Error('This browser does not support Web Crypto.');

  const keyBytes = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt']);
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(data))),
  );
  const payload = new Uint8Array(iv.length + encrypted.length);
  payload.set(iv);
  payload.set(encrypted, iv.length);

  return `${origin}/card?data=${toBase64Url(payload)}#key=${toBase64Url(keyBytes)}`;
}

export async function decryptCardLink(location: Location): Promise<unknown> {
  if (!crypto?.subtle) throw new Error('This browser does not support Web Crypto.');

  const payloadValue = new URLSearchParams(location.search).get('data');
  const keyValue = new URLSearchParams(location.hash.slice(1)).get('key');
  if (!payloadValue || !keyValue) throw new Error('This ID-card link is incomplete.');

  const payload = fromBase64Url(payloadValue);
  const keyBytes = fromBase64Url(keyValue);
  if (payload.length < 29 || keyBytes.length !== 32) throw new Error('This ID-card link is malformed.');

  try {
    const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['decrypt']);
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: payload.slice(0, 12) },
      key,
      payload.slice(12),
    );
    return JSON.parse(decoder.decode(plain));
  } catch {
    throw new Error('This ID-card link is invalid or has been modified.');
  }
}
