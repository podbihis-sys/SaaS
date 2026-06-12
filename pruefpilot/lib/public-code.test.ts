import { describe, expect, it } from "vitest";
import { makePublicCode, PUBLIC_CODE_LENGTH } from "./public-code";

describe("makePublicCode", () => {
  it("erzeugt Codes fester Länge aus dem sicheren Alphabet", () => {
    for (let i = 0; i < 50; i += 1) {
      const code = makePublicCode();
      expect(code).toHaveLength(PUBLIC_CODE_LENGTH);
      expect(code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]+$/);
    }
  });

  it("ist deterministisch bei vorgegebenen Zufallsbytes", () => {
    const bytes = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(makePublicCode(bytes)).toBe(makePublicCode(bytes));
  });

  it("verwirft Bytes oberhalb der Rejection-Grenze (kein Modulo-Bias)", () => {
    // 248–255 würden die ersten 8 Alphabet-Zeichen bevorzugen und müssen übersprungen werden.
    const bytes = new Uint8Array([255, 250, 0, 1, 2, 3, 4, 5, 6, 7]);
    const reference = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(makePublicCode(bytes)).toBe(makePublicCode(reference));
  });

  it("wirft bei zu wenig verwertbaren Zufallsbytes", () => {
    expect(() => makePublicCode(new Uint8Array(4))).toThrow("Zufallsbytes");
    expect(() => makePublicCode(new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]))).toThrow(
      "Zufallsbytes",
    );
  });
});
