/**
 * Zero-Knowledge Client-Side Protection: Military-Grade AES-GCM Encryption
 * Secured by custom PBKDF2 local client key derivation.
 * No raw credentials ever touch the database; everything is processed in-browser.
 */

// Helper to convert ArrayBuffer to Hex String
function bufToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// Helper to convert Hex String to Uint8Array
function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

// Derive AES-GCM key from password using PBKDF2
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a plaintext string using AES-GCM 256 with a password.
 * Returns a serialized JSON string containing hex-encoded salt, iv, and ciphertext.
 */
export async function encryptText(plaintext: string, password: string): Promise<string> {
  try {
    if (!plaintext) return "";
    const enc = new TextEncoder();
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const key = await deriveKey(password, salt);
    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      enc.encode(plaintext)
    );

    const packed = {
      salt: bufToHex(salt),
      iv: bufToHex(iv),
      ciphertext: bufToHex(ciphertextBuffer)
    };

    return JSON.stringify(packed);
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Encryption failed. Check cryptography parameters.");
  }
}

/**
 * Decrypts a serialized JSON string containing hex-encoded salt, iv, and ciphertext using a password.
 */
export async function decryptText(packedJson: string, password: string): Promise<string> {
  try {
    if (!packedJson) return "";
    const parsed = JSON.parse(packedJson);
    if (!parsed.salt || !parsed.iv || !parsed.ciphertext) {
      throw new Error("Invalid cipher packet structure");
    }

    const salt = hexToBuf(parsed.salt);
    const iv = hexToBuf(parsed.iv);
    const ciphertext = hexToBuf(parsed.ciphertext);

    const key = await deriveKey(password, salt);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption failed. Incorrect password or corrupted payload.", error);
    throw new Error("Decryption failed. Incorrect password.");
  }
}

/**
 * Encrypts complex objects (receipts, serials, price lists)
 */
export async function encryptObject<T>(obj: T, password: string): Promise<string> {
  const jsonStr = JSON.stringify(obj);
  return await encryptText(jsonStr, password);
}

/**
 * Decrypts complex objects
 */
export async function decryptObject<T>(packedJson: string, password: string): Promise<T> {
  const decryptedStr = await decryptText(packedJson, password);
  return JSON.parse(decryptedStr) as T;
}
