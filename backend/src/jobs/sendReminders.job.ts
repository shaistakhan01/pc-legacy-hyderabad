import cron from "node-cron";
import { supabaseAdmin } from "../config/supabaseClient.js";
import { sendEmail, buildEmailHtml } from "../services/email.service.js";

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

async function remindRoomBookings(tomorrow: string): Promise<void> {
  const { data: bookings } = await supabaseAdmin
    .from("room_bookings")
    .select(
      `check_in, check_out, num_guests, rooms ( room_number ),
       bookings ( reference_number, status, user_id )`
    )
    .eq("check_in", tomorrow)
    .eq("bookings.status", "confirmed");

  for (const booking of bookings ?? []) {
    const b = booking.bookings as { reference_number: string; status: string; user_id: string } | null;
    if (!b || b.status !== "confirmed") continue;

    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(b.user_id);
    if (!userData.user?.email) continue;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("reminders_enabled")
      .eq("id", b.user_id)
      .single();
    if (profile && profile.reminders_enabled === false) continue;

    const html = buildEmailHtml(
      "Your check-in is tomorrow!",
      `
      <p>Dear ${userData.user.user_metadata?.full_name ?? "Guest"},</p>
      <p>This is a friendly reminder that your room check-in at PC Legacy Hyderabad is <strong>tomorrow</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;">
        <tr><td style="padding:6px 0;color:#4A4A4A;">Reference</td><td style="padding:6px 0;font-weight:600;">${b.reference_number}</td></tr>
        <tr><td style="padding:6px 0;color:#4A4A4A;">Room</td><td style="padding:6px 0;">${(booking.rooms as { room_number: string } | null)?.room_number ?? ""}</td></tr>
        <tr><td style="padding:6px 0;color:#4A4A4A;">Check-in</td><td style="padding:6px 0;">${booking.check_in}</td></tr>
        <tr><td style="padding:6px 0;color:#4A4A4A;">Check-out</td><td style="padding:6px 0;">${booking.check_out}</td></tr>
      </table>
      <p style="margin-top:16px;">Please present your booking reference at the front desk. We look forward to welcoming you!</p>
      `
    );
    await sendEmail(userData.user.email, `Reminder: Check-in Tomorrow — ${b.reference_number}`, html);
  }
}

async function remindRestaurantReservations(tomorrow: string): Promise<void> {
  const { data: reservations } = await supabaseAdmin
    .from("restaurant_reservations")
    .select(
      `reservation_date, reservation_time, party_size,
       bookings ( reference_number, status, user_id )`
    )
    .eq("reservation_date", tomorrow)
    .eq("bookings.status", "confirmed");

  for (const reservation of reservations ?? []) {
    const b = reservation.bookings as { reference_number: string; status: string; user_id: string } | null;
    if (!b || b.status !== "confirmed") continue;

    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(b.user_id);
    if (!userData.user?.email) continue;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("reminders_enabled")
      .eq("id", b.user_id)
      .single();
    if (profile && profile.reminders_enabled === false) continue;

    const html = buildEmailHtml(
      "Your table reservation is tomorrow!",
      `
      <p>Dear ${userData.user.user_metadata?.full_name ?? "Guest"},</p>
      <p>This is a reminder that your table reservation at PC Legacy Hyderabad is <strong>tomorrow</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;">
        <tr><td style="padding:6px 0;color:#4A4A4A;">Reference</td><td style="padding:6px 0;font-weight:600;">${b.reference_number}</td></tr>
        <tr><td style="padding:6px 0;color:#4A4A4A;">Date</td><td style="padding:6px 0;">${reservation.reservation_date}</td></tr>
        <tr><td style="padding:6px 0;color:#4A4A4A;">Time</td><td style="padding:6px 0;">${reservation.reservation_time}</td></tr>
        <tr><td style="padding:6px 0;color:#4A4A4A;">Party Size</td><td style="padding:6px 0;">${reservation.party_size} guests</td></tr>
      </table>
      <p style="margin-top:16px;">Please arrive a few minutes early. See you tomorrow!</p>
      `
    );
    await sendEmail(userData.user.email, `Reminder: Table Reservation Tomorrow — ${b.reference_number}`, html);
  }
}

async function remindBanquetBookings(tomorrow: string): Promise<void> {
  const { data: bookings } = await supabaseAdmin
    .from("banquet_bookings")
    .select(
      `event_date, start_time, end_time, event_type, guest_count,
       event_halls ( name ),
       bookings ( reference_number, status, user_id )`
    )
    .eq("event_date", tomorrow)
    .eq("bookings.status", "confirmed");

  for (const booking of bookings ?? []) {
    const b = booking.bookings as { reference_number: string; status: string; user_id: string } | null;
    if (!b || b.status !== "confirmed") continue;

    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(b.user_id);
    if (!userData.user?.email) continue;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("reminders_enabled")
      .eq("id", b.user_id)
      .single();
    if (profile && profile.reminders_enabled === false) continue;

    const html = buildEmailHtml(
      "Your event is tomorrow!",
      `
      <p>Dear ${userData.user.user_metadata?.full_name ?? "Guest"},</p>
      <p>This is a reminder that your event at PC Legacy Hyderabad is <strong>tomorrow</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;">
        <tr><td style="padding:6px 0;color:#4A4A4A;">Reference</td><td style="padding:6px 0;font-weight:600;">${b.reference_number}</td></tr>
        <tr><td style="padding:6px 0;color:#4A4A4A;">Venue</td><td style="padding:6px 0;">${(booking.event_halls as { name: string } | null)?.name ?? ""}</td></tr>
        <tr><td style="padding:6px 0;color:#4A4A4A;">Event Type</td><td style="padding:6px 0;">${booking.event_type ?? ""}</td></tr>
        <tr><td style="padding:6px 0;color:#4A4A4A;">Date</td><td style="padding:6px 0;">${booking.event_date}</td></tr>
        <tr><td style="padding:6px 0;color:#4A4A4A;">Time</td><td style="padding:6px 0;">${booking.start_time} – ${booking.end_time}</td></tr>
        <tr><td style="padding:6px 0;color:#4A4A4A;">Guests</td><td style="padding:6px 0;">${booking.guest_count}</td></tr>
      </table>
      <p style="margin-top:16px;">Our events team will be ready for you. We look forward to making your event memorable!</p>
      `
    );
    await sendEmail(userData.user.email, `Reminder: Event Tomorrow — ${b.reference_number}`, html);
  }
}

async function remindConferenceBookings(tomorrow: string): Promise<void> {
  const { data: bookings } = await supabaseAdmin
    .from("conference_bookings")
    .select(
      `date, start_time, end_time, attendee_count,
       conference_rooms ( name ),
       bookings ( reference_number, status, user_id )`
    )
    .eq("date", tomorrow)
    .eq("bookings.status", "confirmed");

  for (const booking of bookings ?? []) {
    const b = booking.bookings as { reference_number: string; status: string; user_id: string } | null;
    if (!b || b.status !== "confirmed") continue;

    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(b.user_id);
    if (!userData.user?.email) continue;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("reminders_enabled")
      .eq("id", b.user_id)
      .single();
    if (profile && profile.reminders_enabled === false) continue;

    const html = buildEmailHtml(
      "Your meeting is tomorrow!",
      `
      <p>Dear ${userData.user.user_metadata?.full_name ?? "Guest"},</p>
      <p>This is a reminder that your meeting at PC Legacy Hyderabad is <strong>tomorrow</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;">
        <tr><td style="padding:6px 0;color:#4A4A4A;">Reference</td><td style="padding:6px 0;font-weight:600;">${b.reference_number}</td></tr>
        <tr><td style="padding:6px 0;color:#4A4A4A;">Room</td><td style="padding:6px 0;">${(booking.conference_rooms as { name: string } | null)?.name ?? ""}</td></tr>
        <tr><td style="padding:6px 0;color:#4A4A4A;">Date</td><td style="padding:6px 0;">${booking.date}</td></tr>
        <tr><td style="padding:6px 0;color:#4A4A4A;">Time</td><td style="padding:6px 0;">${booking.start_time} – ${booking.end_time}</td></tr>
        <tr><td style="padding:6px 0;color:#4A4A4A;">Attendees</td><td style="padding:6px 0;">${booking.attendee_count}</td></tr>
      </table>
      <p style="margin-top:16px;">Please let us know if you need any additional arrangements. See you tomorrow!</p>
      `
    );
    await sendEmail(userData.user.email, `Reminder: Meeting Tomorrow — ${b.reference_number}`, html);
  }
}

export async function runReminders(): Promise<void> {
  const tomorrow = getTomorrow();
  console.log(`[Reminders] Running for date: ${tomorrow}`);
  await Promise.all([
    remindRoomBookings(tomorrow),
    remindRestaurantReservations(tomorrow),
    remindBanquetBookings(tomorrow),
    remindConferenceBookings(tomorrow),
  ]);
  console.log("[Reminders] Done.");
}

export function scheduleReminderJob(): void {
  cron.schedule("0 8 * * *", () => {
    console.log("[Reminders] Scheduled job triggered at 8:00 AM");
    runReminders();
  });
  console.log("[Reminders] Daily reminder job scheduled for 8:00 AM.");
}