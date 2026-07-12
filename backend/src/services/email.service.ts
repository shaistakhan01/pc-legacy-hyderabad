import { resend } from "../config/email.js";
import { env } from "../config/env.js";

// Shared HTML shell — every email wraps its specific content in this
// same branded header/footer for visual consistency across all email types.
export function buildEmailHtml(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1A1A1A;">
      <h1 style="font-family: Georgia, serif; color: #0F3D3E; font-size: 22px; margin-bottom: 4px;">
        PC Legacy Hyderabad
      </h1>
      <h2 style="font-size: 16px; color: #4A4A4A; font-weight: 500; margin-top: 0;">${title}</h2>
      <div style="margin-top: 16px; line-height: 1.6;">${bodyHtml}</div>
      <p style="margin-top: 32px; font-size: 12px; color: #9A9A9A;">
        Hyderabad, Telangana, India — This is an automated message, please do not reply directly.
      </p>
    </div>
  `;
}

// Fire-and-forget — a failed email send never blocks or fails the
// booking/cancellation action it's describing.
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  try {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err);
  }
}