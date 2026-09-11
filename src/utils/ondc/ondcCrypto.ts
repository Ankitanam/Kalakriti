// src/utils/ondc/ondcCrypto.ts
import crypto from "crypto";

export interface OndcKeyPair {
  signingPrivateKey: string; // PEM or Base64 DER
  signingPublicKey: string; // Base64 Raw / PEM
}

/**
 * Generates an in-memory Ed25519 keypair for staging protocol signing.
 */
export function generateEd25519KeyPair() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ed25519", {
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
    publicKeyEncoding: { type: "spki", format: "pem" },
  });
  return { privateKey, publicKey };
}

/**
 * Computes BLAKE-512 (blake2b512) Base64 digest of the request body.
 */
export function computeBlake512Digest(body: string | object): string {
  const serialized = typeof body === "string" ? body : JSON.stringify(body);
  return crypto.createHash("blake2b512").update(serialized).digest("base64");
}

/**
 * Builds the canonical ONDC signing string.
 */
export function buildSigningString(created: number, expires: number, digest: string): string {
  return `(created): ${created}\n(expires): ${expires}\ndigest: BLAKE-512=${digest}`;
}

/**
 * Signs payload using Ed25519 and creates the standard ONDC Authorization header.
 */
export function createOndcAuthHeader({
  subscriberId,
  uniqueKeyId,
  privateKey,
  body,
}: {
  subscriberId: string;
  uniqueKeyId: string;
  privateKey: crypto.KeyObject | string;
  body: string | object;
}): { authorization: string; digest: string } {
  const digest = computeBlake512Digest(body);
  const created = Math.floor(Date.now() / 1000);
  const expires = created + 300; // 5 min TTL
  const signingString = buildSigningString(created, expires, digest);

  const signature = crypto
    .sign(null, Buffer.from(signingString), privateKey)
    .toString("base64");

  const authorization = `Signature keyId="${subscriberId}|${uniqueKeyId}|ed25519",algorithm="ed25519",created="${created}",expires="${expires}",headers="(created) (expires) digest",signature="${signature}"`;

  return { authorization, digest };
}

/**
 * Verifies an incoming ONDC Authorization header.
 */
export function verifyOndcSignature({
  authHeader,
  body,
  publicKey,
}: {
  authHeader: string;
  body: string | object;
  publicKey: crypto.KeyObject | string;
}): boolean {
  try {
    const parts = authHeader.replace(/^Signature\s+/i, "").split(",");
    const map: Record<string, string> = {};
    for (const part of parts) {
      const idx = part.indexOf("=");
      if (idx !== -1) {
        const k = part.substring(0, idx).trim();
        const v = part.substring(idx + 1).replace(/^"|"$/g, "").trim();
        map[k] = v;
      }
    }

    const created = Number(map["created"]);
    const expires = Number(map["expires"]);
    const signature = map["signature"];

    if (!created || !expires || !signature) return false;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (now > expires) return false;

    const digest = computeBlake512Digest(body);
    const signingString = buildSigningString(created, expires, digest);

    return crypto.verify(
      null,
      Buffer.from(signingString),
      publicKey,
      Buffer.from(signature, "base64")
    );
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

