import { describe, expect, it } from "vitest";
import { calcRentalPrice } from "./pricing";

describe("calcRentalPrice", () => {
  it("counts a single day (start === end) as 1 day", () => {
    const r = calcRentalPrice({
      pricePerDay: 50,
      depositAmount: 100,
      startDate: "2026-06-01",
      endDate: "2026-06-01",
    });
    expect(r).toEqual({ days: 1, rentalTotal: 50, depositTotal: 100 });
  });

  it("counts both start and end day (inclusive)", () => {
    const r = calcRentalPrice({
      pricePerDay: 50,
      depositAmount: 100,
      startDate: "2026-06-01",
      endDate: "2026-06-03", // 1st, 2nd, 3rd => 3 days
    });
    expect(r.days).toBe(3);
    expect(r.rentalTotal).toBe(150);
    expect(r.depositTotal).toBe(100);
  });

  it("multiplies rental AND deposit by quantity", () => {
    const r = calcRentalPrice({
      pricePerDay: 20,
      depositAmount: 30,
      startDate: "2026-06-01",
      endDate: "2026-06-02", // 2 days
      quantity: 4,
    });
    expect(r.days).toBe(2);
    expect(r.rentalTotal).toBe(160); // 2 * 20 * 4
    expect(r.depositTotal).toBe(120); // 30 * 4
  });

  it("spans month boundaries correctly", () => {
    const r = calcRentalPrice({
      pricePerDay: 10,
      depositAmount: 0,
      startDate: "2026-01-30",
      endDate: "2026-02-02", // 30,31,1,2 => 4 days
    });
    expect(r.days).toBe(4);
    expect(r.rentalTotal).toBe(40);
  });

  it("is unaffected by DST (uses UTC day math)", () => {
    // Around the European DST switch (late March).
    const r = calcRentalPrice({
      pricePerDay: 10,
      depositAmount: 0,
      startDate: "2026-03-28",
      endDate: "2026-03-30", // 3 days regardless of clock change
    });
    expect(r.days).toBe(3);
  });

  it("rounds money to 2 decimals without float drift", () => {
    const r = calcRentalPrice({
      pricePerDay: 0.1,
      depositAmount: 0.2,
      startDate: "2026-06-01",
      endDate: "2026-06-03", // 3 days => 0.30000000000000004 naively
    });
    expect(r.rentalTotal).toBe(0.3);
    expect(r.depositTotal).toBe(0.2);
  });

  it("accepts Date objects", () => {
    const r = calcRentalPrice({
      pricePerDay: 5,
      depositAmount: 0,
      startDate: new Date(Date.UTC(2026, 5, 1)),
      endDate: new Date(Date.UTC(2026, 5, 5)),
    });
    expect(r.days).toBe(5);
    expect(r.rentalTotal).toBe(25);
  });

  it("rejects an end date before the start date", () => {
    expect(() =>
      calcRentalPrice({
        pricePerDay: 5,
        depositAmount: 0,
        startDate: "2026-06-05",
        endDate: "2026-06-01",
      }),
    ).toThrow();
  });

  it("rejects an invalid quantity", () => {
    expect(() =>
      calcRentalPrice({
        pricePerDay: 5,
        depositAmount: 0,
        startDate: "2026-06-01",
        endDate: "2026-06-01",
        quantity: 0,
      }),
    ).toThrow();
  });

  it("rejects a malformed date string", () => {
    expect(() =>
      calcRentalPrice({
        pricePerDay: 5,
        depositAmount: 0,
        startDate: "not-a-date",
        endDate: "2026-06-01",
      }),
    ).toThrow();
  });
});
