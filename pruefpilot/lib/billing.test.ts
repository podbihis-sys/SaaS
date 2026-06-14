import { describe, expect, it } from "vitest";
import { hasAccess, trialDaysLeft } from "./billing";

const NOW = new Date("2026-06-12T12:00:00Z");

describe("hasAccess", () => {
  it.each([
    ["active", "2020-01-01T00:00:00Z", true],
    ["past_due", "2020-01-01T00:00:00Z", true],
    ["trialing", "2026-06-13T12:00:00Z", true],
    ["trialing", "2026-06-12T11:59:00Z", false],
    ["canceled", "2030-01-01T00:00:00Z", false],
    ["unpaid", "2030-01-01T00:00:00Z", false],
    ["incomplete", "2030-01-01T00:00:00Z", false],
  ])("status=%s, trialEnde=%s → %s", (status, trialEnd, expected) => {
    expect(
      hasAccess({ subscription_status: status, trial_ends_at: trialEnd }, NOW),
    ).toBe(expected);
  });
});

describe("trialDaysLeft", () => {
  it("rundet angebrochene Tage auf", () => {
    expect(
      trialDaysLeft({ subscription_status: "trialing", trial_ends_at: "2026-06-13T13:00:00Z" }, NOW),
    ).toBe(2);
  });

  it("ist nie negativ", () => {
    expect(
      trialDaysLeft({ subscription_status: "trialing", trial_ends_at: "2026-06-01T00:00:00Z" }, NOW),
    ).toBe(0);
  });
});
