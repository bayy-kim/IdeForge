import crypto from "crypto";

/**
 * AES-256-GCM encryption/decryption for sensitive user settings.
 *
 * Format: iv:authTag:ciphertext (each part base64-encoded, colon-separated)
 *
 * NOTE: Data that was stored as plaintext BEFORE encryption was introduced
 * will NOT be automatically migrated. When a user saves their API key again,
 * it will be overwritten with the encrypted version. Plaintext values that
 * don't match the colon-separated base64 format are returned as-is by decrypt().
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits recommended for GCM
const TAG_LENGTH = 16; // 128 bits

function getKey(): Buffer {
  const raw = process.env.SETTINGS_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "SETTINGS_ENCRYPTION_KEY belum di-set di environment. " +
        "Generate dengan: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\" " +
        "lalu tambahkan ke .env.local atau Vercel dashboard.",
    );
  }
  return Buffer.from(raw, "base64");
}

export function encrypt(text: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag().toString("base64");

  return `${iv.toString("base64")}:${authTag}:${encrypted}`;
}

export function decrypt(cipher: string): string {
  // Check if this looks like encrypted format (base64:base64:base64)
  const parts = cipher.split(":");
  if (parts.length !== 3) {
    // Probably legacy plaintext — return as-is
    return cipher;
  }

  const key = getKey();
  const [ivB64, authTagB64, encrypted] = parts;

  try {
    const iv = Buffer.from(ivB64, "base64");
    const authTag = Buffer.from(authTagB64, "base64");

    if (iv.length !== IV_LENGTH || authTag.length !== TAG_LENGTH) {
      return cipher; // not valid encrypted data, return as-is
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    // If decryption fails (e.g. key changed, data corrupted), return original
    // so the app doesn't break — user can re-enter their key
    return cipher;
  }
}

/** Keys whose values should be encrypted at rest. */
export const SENSITIVE_SETTING_KEYS = new Set(["ai_api_key"]);
