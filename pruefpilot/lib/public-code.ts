// Ohne leicht verwechselbare Zeichen (0/O, 1/I/L).
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const PUBLIC_CODE_LENGTH = 8;

export function makePublicCode(randomValues?: Uint8Array): string {
  const bytes = randomValues ?? crypto.getRandomValues(new Uint8Array(PUBLIC_CODE_LENGTH));
  if (bytes.length < PUBLIC_CODE_LENGTH) {
    throw new Error(`Mindestens ${PUBLIC_CODE_LENGTH} Zufallsbytes erforderlich`);
  }
  let code = "";
  for (let i = 0; i < PUBLIC_CODE_LENGTH; i += 1) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}
