// Ohne leicht verwechselbare Zeichen (0/O, 1/I/L).
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const PUBLIC_CODE_LENGTH = 8;

// Rejection Sampling: Bytes >= REJECT_ABOVE würden das Alphabet ungleich gewichten (Modulo-Bias).
const REJECT_ABOVE = Math.floor(256 / ALPHABET.length) * ALPHABET.length; // 248

function takeFromBytes(bytes: Uint8Array, code: string): string {
  for (const byte of bytes) {
    if (code.length >= PUBLIC_CODE_LENGTH) break;
    if (byte < REJECT_ABOVE) {
      code += ALPHABET[byte % ALPHABET.length];
    }
  }
  return code;
}

export function makePublicCode(randomValues?: Uint8Array): string {
  if (randomValues) {
    const code = takeFromBytes(randomValues, "");
    if (code.length < PUBLIC_CODE_LENGTH) {
      throw new Error(
        `Zu wenige verwertbare Zufallsbytes (benötigt ${PUBLIC_CODE_LENGTH}, erhalten ${code.length})`,
      );
    }
    return code;
  }

  let code = "";
  while (code.length < PUBLIC_CODE_LENGTH) {
    code = takeFromBytes(crypto.getRandomValues(new Uint8Array(PUBLIC_CODE_LENGTH * 2)), code);
  }
  return code;
}
