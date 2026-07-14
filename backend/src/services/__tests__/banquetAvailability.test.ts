import { describe, it, expect } from "vitest";
import { calculateAddOnsCost } from "../banquetAvailability.service.js";

describe("calculateAddOnsCost", () => {
  it("charges catering add-ons per plate (multiplied by guest count)", () => {
    const result = calculateAddOnsCost(
      [{ price: 900, category: "catering" }],
      150
    );
    expect(result).toBe(900 * 150);
  });

  it("charges decoration and AV add-ons as a flat fee regardless of guest count", () => {
    const result = calculateAddOnsCost(
      [{ price: 25000, category: "decoration" }],
      500
    );
    expect(result).toBe(25000);
  });

  it("sums multiple add-ons of mixed categories correctly", () => {
    const result = calculateAddOnsCost(
      [
        { price: 900, category: "catering" },
        { price: 25000, category: "decoration" },
        { price: 18000, category: "av_equipment" },
      ],
      100
    );
    expect(result).toBe(90000 + 25000 + 18000);
  });

  it("returns 0 for an empty add-ons array", () => {
    expect(calculateAddOnsCost([], 100)).toBe(0);
  });

  it("treats an unrecognized category as a flat fee, not per-guest", () => {
    const result = calculateAddOnsCost([{ price: 5000, category: null }], 200);
    expect(result).toBe(5000);
  });
});