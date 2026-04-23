import crypto from "crypto";

function normalizePem(value: string | undefined): string {
  return (value || "").replace(/\\n/g, "\n").trim();
}

function getPublicKey(): string {
  const key = normalizePem(process.env.VOTE_RSA_PUBLIC_KEY);
  if (!key) {
    throw new Error("Missing VOTE_RSA_PUBLIC_KEY environment variable");
  }
  return key;
}

function getPrivateKey(): string {
  const key = normalizePem(process.env.VOTE_RSA_PRIVATE_KEY);
  if (!key) {
    throw new Error("Missing VOTE_RSA_PRIVATE_KEY environment variable");
  }
  return key;
}

export function encryptBallot(candidateId: string): string {
  const buffer = Buffer.from(candidateId, "utf8");
  return crypto.publicEncrypt(
    {
      key: getPublicKey(),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    buffer
  ).toString("base64");
}

export function decryptBallot(encryptedBallot: string): string {
  const encryptedBuffer = Buffer.from(encryptedBallot, "base64");
  return crypto.privateDecrypt(
    {
      key: getPrivateKey(),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    encryptedBuffer
  ).toString("utf8");
}
