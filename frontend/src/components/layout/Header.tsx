import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/common";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-surface">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
        <span className="font-heading text-xl text-primary">
          PC Legacy Hyderabad
        </span>

        <nav className="hidden gap-6 text-sm font-medium text-neutral-700 md:flex">
          <a href="/rooms"    className="hover:text-primary transition-colors">Rooms</a>
          <a href="/dining"   className="hover:text-primary transition-colors">Dining</a>
          <a href="/events"   className="hover:text-primary transition-colors">Events</a>
          <a href="/meetings" className="hover:text-primary transition-colors">Meetings</a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/account/bookings"
                className="hidden text-sm font-medium text-neutral-700 hover:text-primary transition-colors md:inline"
              >
                My Bookings
              </Link>
              <Button size="sm" variant="secondary" onClick={handleLogout}>
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden text-sm font-medium text-neutral-700 hover:text-primary transition-colors md:inline"
              >
                Log In
              </Link>
              <Button size="sm" onClick={() => navigate("/register")}>
                Book Now
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}