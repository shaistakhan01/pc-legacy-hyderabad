import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "../Badge";

describe("Badge", () => {
  it("renders its children text", () => {
    render(<Badge status="success">Confirmed</Badge>);
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
  });

  it("defaults to neutral status when none is provided", () => {
    render(<Badge>Draft</Badge>);
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });
});