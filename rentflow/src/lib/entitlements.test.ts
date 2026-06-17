import { describe, expect, it } from "vitest";
import { getEntitlements, shouldShowBranding } from "./entitlements";

describe("getEntitlements", () => {
  it("defaults to free limits for a missing profile", () => {
    const e = getEntitlements(null);
    expect(e.plan).toBe("free");
    expect(e.maxItems).toBe(3);
    expect(e.canRemoveBranding).toBe(false);
  });

  it("grants pro entitlements when active", () => {
    const e = getEntitlements({ plan: "pro", plan_status: "active" });
    expect(e.maxItems).toBeNull(); // unlimited
    expect(e.canRemoveBranding).toBe(true);
    expect(e.reminderFrequency).toBe("daily");
  });

  it("treats trialing as active", () => {
    const e = getEntitlements({ plan: "solo", plan_status: "trialing" });
    expect(e.active).toBe(true);
    expect(e.maxItems).toBe(40);
  });

  it("falls back to free limits when a paid plan is past_due", () => {
    const e = getEntitlements({ plan: "pro", plan_status: "past_due" });
    expect(e.plan).toBe("free");
    expect(e.maxItems).toBe(3);
    expect(e.canRemoveBranding).toBe(false);
  });
});

describe("shouldShowBranding", () => {
  it("always shows branding on free even if toggled off", () => {
    expect(
      shouldShowBranding({ plan: "free", plan_status: "active", branding_enabled: false }),
    ).toBe(true);
  });

  it("lets an active pro tenant hide branding", () => {
    expect(
      shouldShowBranding({ plan: "pro", plan_status: "active", branding_enabled: false }),
    ).toBe(false);
  });

  it("forces branding for a pro tenant that lapsed to past_due", () => {
    expect(
      shouldShowBranding({ plan: "pro", plan_status: "past_due", branding_enabled: false }),
    ).toBe(true);
  });
});
