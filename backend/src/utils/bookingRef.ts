import { customAlphabet } from "nanoid";
// Generates booking references like "EVT-2025-A3K9B"
const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6);

export function generateBookingRef(): string {
  const year = new Date().getFullYear();
  return `EVT-${year}-${nanoid()}`;
}

export function generateTicketCode(): string {
  const ts = Date.now().toString(36).toUpperCase();
  return `TKT-${ts}-${nanoid()}`;
}
