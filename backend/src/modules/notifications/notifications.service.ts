import nodemailer from "nodemailer";
import { config } from "../../config";
import { logger } from "../../utils/logger";

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_SECURE as boolean,
  auth: config.SMTP_USER
    ? { user: config.SMTP_USER, pass: config.SMTP_PASS }
    : undefined,
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const notificationsService = {
  async sendEmail(opts: EmailOptions): Promise<void> {
    try {
      await transporter.sendMail({
        from: config.EMAIL_FROM,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      });
      logger.info({ to: opts.to, subject: opts.subject }, "Email sent");
    } catch (err) {
      logger.error({ err, to: opts.to }, "Failed to send email");
      throw err;
    }
  },

  async sendBookingConfirmation(data: {
    to: string;
    username: string;
    bookingRef: string;
    eventTitle: string;
    eventDate: Date;
    venue: string;
    totalAmount: number;
    items: Array<{ category: string; quantity: number; unitPrice: number }>;
  }): Promise<void> {
    const itemRows = data.items
      .map(
        (i) =>
          `<tr><td>${i.category}</td><td>${i.quantity}</td><td>₹${i.unitPrice.toFixed(2)}</td><td>₹${(i.quantity * i.unitPrice).toFixed(2)}</td></tr>`,
      )
      .join("");

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Booking Confirmed</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
  <div style="background: white; border-radius: 12px; padding: 32px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #6366f1; margin: 0;">🎉 Booking Confirmed!</h1>
    </div>
    <p>Hi <strong>${data.username}</strong>,</p>
    <p>Your booking has been confirmed. Here are the details:</p>
    <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p><strong>Booking Reference:</strong> ${data.bookingRef}</p>
      <p><strong>Event:</strong> ${data.eventTitle}</p>
      <p><strong>Date:</strong> ${new Date(data.eventDate).toLocaleString()}</p>
      <p><strong>Venue:</strong> ${data.venue}</p>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <thead>
        <tr style="background: #6366f1; color: white;">
          <th style="padding: 8px; text-align: left;">Category</th>
          <th style="padding: 8px; text-align: left;">Qty</th>
          <th style="padding: 8px; text-align: left;">Price</th>
          <th style="padding: 8px; text-align: left;">Subtotal</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="text-align: right; padding: 8px;"><strong>Total</strong></td>
          <td style="padding: 8px;"><strong>₹${data.totalAmount.toFixed(2)}</strong></td>
        </tr>
      </tfoot>
    </table>
    <p>Your QR code tickets will be emailed to you shortly.</p>
    <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 12px;">EventBooking Platform · If you didn't make this booking, please contact support.</p>
  </div>
</body>
</html>`;

    await notificationsService.sendEmail({
      to: data.to,
      subject: `Booking Confirmed - ${data.eventTitle} [${data.bookingRef}]`,
      html,
    });
  },

  async sendBookingCancellation(data: {
    to: string;
    username: string;
    bookingRef: string;
    eventTitle: string;
    reason?: string;
  }): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: white; border-radius: 12px; padding: 32px;">
    <h1 style="color: #ef4444;">Booking Cancelled</h1>
    <p>Hi <strong>${data.username}</strong>,</p>
    <p>Your booking <strong>${data.bookingRef}</strong> for <strong>${data.eventTitle}</strong> has been cancelled.</p>
    ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ""}
    <p>If you paid for this booking, a refund will be processed within 5-7 business days.</p>
  </div>
</body>
</html>`;

    await notificationsService.sendEmail({
      to: data.to,
      subject: `Booking Cancelled - ${data.eventTitle}`,
      html,
    });
  },

  async sendWelcome(data: { to: string; username: string }): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: white; border-radius: 12px; padding: 32px; text-align: center;">
    <h1 style="color: #6366f1;">Welcome to EventBooking! 🎪</h1>
    <p>Hi <strong>${data.username}</strong>,</p>
    <p>Welcome aboard! You're all set to discover and book amazing events.</p>
    <a href="${config.FRONTEND_URL}/events" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">Browse Events</a>
  </div>
</body>
</html>`;

    await notificationsService.sendEmail({
      to: data.to,
      subject: "Welcome to EventBooking!",
      html,
    });
  },
};
