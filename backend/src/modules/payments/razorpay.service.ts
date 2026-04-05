import Razorpay from "razorpay";
import crypto from "crypto";
import { config } from "../../config";
import { AppError } from "../../utils/AppError";

let razorpay: Razorpay;

function getRazorpay(): Razorpay {
  if (!razorpay) {
    if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
      throw AppError.internal("Razorpay is not configured");
    }
    razorpay = new Razorpay({
      key_id: config.RAZORPAY_KEY_ID,
      key_secret: config.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
}

export const razorpayService = {
  async createOrder(amount: number, currency = "INR", receipt: string) {
    const orderData = await getRazorpay().orders.create({
      amount: Math.round(amount * 100), // paise
      currency,
      receipt,
    });
    return orderData;
  },

  verifySignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    const expected = crypto
      .createHmac("sha256", config.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    return expected === signature;
  },

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expected = crypto
      .createHmac("sha256", config.RAZORPAY_WEBHOOK_SECRET!)
      .update(payload)
      .digest("hex");
    return expected === signature;
  },

  async fetchPayment(paymentId: string) {
    return getRazorpay().payments.fetch(paymentId);
  },

  async refundPayment(paymentId: string, amount?: number) {
    return getRazorpay().payments.refund(paymentId, {
      ...(amount ? { amount: Math.round(amount * 100) } : {}),
    });
  },
};
