/**
 * Client-side password hashing for the local MVP.
 * Plaintext passwords must never be persisted.
 */
export const sha256Hex = async (plainText) => {
  if (typeof plainText !== "string" || plainText.length === 0) {
    return "";
  }

  const data = new TextEncoder().encode(plainText);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};
