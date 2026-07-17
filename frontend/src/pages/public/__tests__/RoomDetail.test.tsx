import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// Mock every external dependency the page touches — Supabase client,
// the availability/booking services, and auth — so this test exercises
// only the component's own rendering and interaction logic.
vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: {
                id: "room-1",
                name: "Deluxe Room",
                description: "A nice room.",
                base_price: 4500,
                max_occupancy: 2,
                amenities: ["WiFi", "AC"],
                image_url: null,
              },
            }),
        }),
      }),
    }),
  },
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("@/services/roomBookings", () => ({
  checkAvailability: vi.fn().mockResolvedValue({
    success: true,
    available: true,
    nights: 2,
    totalAmount: 9000,
  }),
  createRoomBooking: vi.fn(),
}));

import { RoomDetail } from "../RoomDetail";

describe("RoomDetail — availability check flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the room name and price after loading", async () => {
    render(
      <MemoryRouter initialEntries={["/rooms/room-1"]}>
        <Routes>
          <Route path="/rooms/:roomId" element={<RoomDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Deluxe Room")).toBeInTheDocument();
    expect(screen.getByText(/4500\/night/)).toBeInTheDocument();
  });

  it("shows the price breakdown and a Log In prompt after checking availability while logged out", async () => {
    render(
      <MemoryRouter initialEntries={["/rooms/room-1"]}>
        <Routes>
          <Route path="/rooms/:roomId" element={<RoomDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText("Deluxe Room");

    const checkInInput = screen.getByLabelText("Check-in");
    const checkOutInput = screen.getByLabelText("Check-out");
    await userEvent.type(checkInInput, "2026-09-01");
    await userEvent.type(checkOutInput, "2026-09-03");

    await userEvent.click(screen.getByRole("button", { name: "Check Availability" }));

    await waitFor(() => {
      expect(screen.getByText(/9000/)).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Log In to Book" })).toBeInTheDocument();
  });
});