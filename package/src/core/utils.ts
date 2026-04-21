/**
 * Utility functions for the generate command.
 *
 * - deriveKebabName: derives a kebab-case file name from a prompt string
 * - encodeAudioToDataUri / decodeDataUriToBuffer: base64 data URI round-trip
 */

/**
 * Derive a kebab-case name from the first three words of a prompt.
 * Strips special characters, lowercases, and joins with hyphens.
 * Returns at most three segments.
 */
export function deriveKebabName(prompt: string): string {
  const words = prompt
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .slice(0, 3)
    .map((w) => w.toLowerCase());

  if (words.length === 0) {
    return "generated-sound";
  }

  return words.join("-");
}

/**
 * Encode a raw audio buffer as a data URI with audio/mpeg MIME type.
 */
export function encodeAudioToDataUri(buffer: Buffer): string {
  const base64 = buffer.toString("base64");
  return `data:audio/mpeg;base64,${base64}`;
}

/**
 * Decode a base64 data URI back to a Buffer.
 * Expects format: `data:<mime>;base64,<data>`
 */
export function decodeDataUriToBuffer(dataUri: string): Buffer {
  const commaIndex = dataUri.indexOf(",");
  if (commaIndex === -1) {
    throw new Error("Invalid data URI: missing comma separator");
  }
  const base64 = dataUri.slice(commaIndex + 1);
  return Buffer.from(base64, "base64");
}
