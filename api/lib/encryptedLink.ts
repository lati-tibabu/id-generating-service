import { createCipheriv, pbkdf2, randomBytes } from 'node:crypto';
import { promisify } from 'node:util';
import type { IdCardData } from './pdfGenerator.js';

const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const PBKDF2_ITERATIONS = 210_000;
const deriveKey = promisify(pbkdf2);

function base64Url(value: Buffer): string {
  return value.toString('base64url');
}

function generatePassword(): string {
  const bytes = randomBytes(16);
  const compact = Array.from(bytes, (value) => PASSWORD_ALPHABET[value & 31]).join('');
  return compact.match(/.{1,4}/g)!.join('-');
}

export interface EncryptedLinkResult {
  encryptedIdCardUrl: string;
  idCardPassword: string;
}

export async function generateEncryptedCardLink(data: IdCardData, appUrl: string): Promise<EncryptedLinkResult> {
  const idCardPassword = generatePassword();
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = await deriveKey(idCardPassword, salt, PBKDF2_ITERATIONS, 32, 'sha256');
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
  const payload = Buffer.concat([salt, iv, ciphertext, cipher.getAuthTag()]);

  return {
    encryptedIdCardUrl: `${appUrl.replace(/\/$/, '')}/card?data=${base64Url(payload)}`,
    idCardPassword,
  };
}
