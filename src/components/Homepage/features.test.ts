import { describe, expect, it } from "vitest";
import { features } from "./features-data";
import { SOON_FEATURES } from "@/lib/soon";

describe("homepage features data", () => {
  it("has exactly the coming-soon slugs from soon.ts", () => {
    const slugs = features
      .filter((f) => f.badge)
      .map((f) => f.soonSlug)
      .sort();
    expect(slugs).toEqual(SOON_FEATURES.map((s) => s.slug).sort());
    expect(slugs).toHaveLength(6);
  });

  it("gives no badge or soon slug to built features", () => {
    const built = features.filter((f) => !f.badge);
    expect(built).toHaveLength(5);
    for (const f of built) expect(f.soonSlug).toBeUndefined();
  });
});
