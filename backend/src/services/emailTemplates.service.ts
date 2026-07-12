import { buildEmailHtml, sendEmail } from "./email.service.js";

// ── Room Booking Confirmation ────────────────────────────────────────────────

export async function sendRoomBookingConfirmation(
  to: string,
  data: {
    guestName: string;
    referenceNumber: string;
    roomType: string;
    roomNumber: string;
    checkIn: string;
    checkOut: string;
    numGuests: number;
    totalAmount: number;
  }
): Promise<void> {
  const html = buildEmailHtml(
    "Room Booking Confirmed",
    `
    <p>Dear ${data.guestName},</p>
    <p>Your room booking has been confirmed. Here are your details:</p>
    <table style="width:100%;border-collapse:collapse;margin-top:12px;">
      <tr><td style="padding:6px 0;color:#4A4A4A;">Reference</td><td style="padding:6px 0;font-weight:600;">${data.referenceNumber}</td></tr>
      <tr><td style="padding:6px 0;color:#4A4A4A;">Room Type</td><td style="padding:6px 0;">${data.roomType}</td></tr>
      <tr><td style="padding:6px 0;color:#4A4A4A;">Room Number</td><td style="padding:6px 0;">${data.roomNumber}</td></tr>
      <tr><td style="padding:6px 0;color:#4A4A4A;">Check-in</td><td style="padding:6px 0;">${data.checkIn}</td></tr>
      <tr><td style="padding:6px 0;color:#4A4A4A;">Check-out</td><td style="padding:6px 0;">${data.checkOut}</td></tr>
      <tr><td style="padding:6px 0;color:#4A4A4A;">Guests</td><td style="padding:6px 0;">${data.numGuests}</td></tr>
      <tr><td style="padding:6px 0;color:#4A4A4A;">Total Paid</td><td style="padding:6px 0;font-weight:600;color:#0F3D3E;">₹${data.totalAmount.toLocaleString()}</td></tr>
    </table>
    <p style="margin-top:16px;">We look forward to welcoming you. Please present this confirmation at check-in.</p>
    `
  );
  await sendEmail(to, `Booking Confirmed — ${data.referenceNumber}`, html);
}

// ── Restaurant Reservation Confirmation ─────────────────────────────────────

export async function sendRestaurantConfirmation(
  to: string,
  data: {
    guestName: string;
    referenceNumber: string;
    tableNumber: string;
    reservationDate: string;
    reservationTime: string;
    partySize: number;
  }
): Promise<void> {
  const html = buildEmailHtml(
    "Table Reservation Confirmed",
    `
    <p>Dear ${data.guestName},</p>
    <p>Your table reservation at PC Legacy Hyderabad has been confirmed.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:12px;">
      <tr><td style="padding:6px 0;color:#4A4A4A;">Reference</td><td style="padding:6px 0;font-weight:600;">${data.referenceNumber}</td></tr>
      <tr><td style="padding:6px 0;color:#4A4A4A;">Table</td><td style="padding:6px 0;">${data.tableNumber}</td></tr>
      <tr><td style="padding:6px 0;color:#4A4A4A;">Date</td><td style="padding:6px 0;">${data.reservationDate}</td></tr>
      <tr><td style="padding:6px 0;color:#4A4A4A;">Time</td><td style="padding:6px 0;">${data.reservationTime}</td></tr>
      <tr><td style="padding:6px 0;color:#4A4A4A;">Party Size</td><td style="padding:6px 0;">${data.partySize} guests</td></tr>
    </table>
    <p style="margin-top:16px;">We look forward to serving you. Please arrive a few minutes early.</p>
    `
  );
  await sendEmail(to, `Reservation Confirmed — ${data.referenceNumber}`, html);
}

// ── Banquet / Event Booking Confirmation ─────────────────────────────────────

export async function sendBanquetConfirmation(
  to: string,
  data: {
    guestName: string;
    referenceNumber: string;
    hallName: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    eventType: string;
    guestCount: number;
    totalAmount: number;
  }
): Promise<void> {
  const html = buildEmailHtml(
    "Event Booking Confirmed",
    `
    <p>Dear ${data.guestName},</p>
    <p>Your event booking at PC Legacy Hyderabad has been confirmed.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:12px;">
      <tr><td style="padding:6px 0;color:#4A4A4A;">Reference</td><td style="padding:6px 0;font-weight:600;">${data.referenceNumber}</td></tr>
      <tr><td style="padding:6px 0;color:#4A4A4A;">Venue</td><td style="padding:6px 0;">${data.hallName}</td></tr>
      <tr><td style="padding:6px 0;color:#4A4A4A;">Event Type</td><td style="padding:6px 0;">${data.eventType}</td></tr>
      <tr><td style="padding:6px 0;color:#4A4A4A;">Date</td><td style="padding:6px 0;">${data.eventDate}</td></tr>
      <tr><td style="padding:6px 0;color:#4A4A4A;">Time</td><td style="padding:6px 0;">${data.startTime} – ${data.endTime}</td></tr>
      <tr><td style="padding:6px 0;color:#4A4A4A;">Guests</td><td style="padding:6px 0;">${data.guestCount}</td></tr>
      <tr><td style="padding:6px 0;color:#4A4A4A;">Total Paid</td><td style="padding:6px 0;font-weight:600;color:#0F3D3E;">₹${data.totalAmount.toLocaleString()}</td></tr>
    </table>
    <p style="margin-top:16px;">Our events team will be in touch to discuss further arrangements.</p>
    `
  );
  await sendEmail(to, `Event Booking Confirmed — ${data.referenceNumber}`, html);
}

// ── Conference Booking Confirmation ──────────────────────────────────────────

export async function sendConferenceConfirmation(
  to: string,
  data: {
    guestName: string;
    referenceNumber: string;
    roomName: string;
    date: string;
    startTime: string;
    endTime: string;
    attendeeCount: number;
    totalAmount: number;
  }
): Promise<void> {
  const html = buildEmailHtml(
    "Meeting Room Booking Confirmed",
    `
    <p>Dear ${data.guestName},</p>
    <p>Your meeting room booking at PC Legacy Hyderabad has been confirmed.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:12px;">
      <tr><td style="padding:6px 0;color:#4A4A4A;">Reference</td><td style="padding:6px 0;font-weight:600;">${data.referenceNumber}</td></tr>
      <tr><td style="padding:6px 0;color:#4A4A4A;">Room</td><td style="padding:6px 0;">${data.roomName}</td></tr>
      <tr><td style="padding:6px 0;color:#4A4A4A;">Date</td><td style="padding:6px 0;">${data.date}</td></tr>
      <tr><td style="padding:6px 0;color:#4A4A4A;">Time</td><td style="padding:6px 0;">${data.startTime} – ${data.endTime}</td></tr>
      <tr><td style="padding:6px 0;color:#4A4A4A;">Attendees</td><td style="padding:6px 0;">${data.attendeeCount}</td></tr>
      <tr><td style="padding:6px 0;color:#4A4A4A;">Total Paid</td><td style="padding:6px 0;font-weight:600;color:#0F3D3E;">₹${data.totalAmount.toLocaleString()}</td></tr>
    </table>
    <p style="margin-top:16px;">Please contact us if you need any additional equipment or arrangements.</p>
    `
  );
  await sendEmail(to, `Meeting Confirmed — ${data.referenceNumber}`, html);
}