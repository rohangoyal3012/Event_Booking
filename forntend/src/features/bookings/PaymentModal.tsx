import { useEffect, useState } from "react";
import { Modal, Button, Spinner } from "@/components/ui";
import { formatPrice } from "@/utils/format";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { bookingsService } from "@/services/bookings.service";
import { paymentsService } from "@/services/bookings.service";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/utils/constants";
import toast from "react-hot-toast";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PaymentModal({ open, onClose }: PaymentModalProps) {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState<"review" | "processing">("review");

  // Load Razorpay SDK on mount
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleBook = async () => {
    if (!items.length) return;
    setStep("processing");

    try {
      const eventId = items[0].eventId;
      const bookingItems = items.map((i) => ({
        ticketCategoryId: i.ticketCategoryId,
        quantity: i.quantity,
      }));

      // 1. Create booking
      const booking = await bookingsService.create({
        eventId,
        items: bookingItems,
      });

      // Free event — no payment needed
      if (booking.totalAmount === 0) {
        clearCart();
        navigate(ROUTES.BOOKING_SUCCESS, {
          state: { bookingRef: booking.bookingRef },
        });
        return;
      }

      // 2. Create Razorpay order
      const { razorpayOrderId, amount, currency } =
        await paymentsService.createOrder(booking.id);

      // 3. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID ?? "",
        amount,
        currency,
        order_id: razorpayOrderId,
        name: "EventBook",
        description: items.map((i) => i.name).join(", "),
        prefill: { name: user?.name ?? "", email: user?.email ?? "" },
        theme: { color: "#4f46e5" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await paymentsService.verify({
              bookingId: booking.id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            clearCart();
            navigate(ROUTES.BOOKING_SUCCESS, {
              state: { bookingRef: booking.bookingRef },
            });
          } catch {
            toast.error("Payment verification failed. Contact support.");
            setStep("review");
          }
        },
        modal: {
          ondismiss: () => setStep("review"),
        },
      });

      rzp.open();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Booking failed";
      toast.error(message);
      setStep("review");
    }
  };

  const total = totalAmount();

  return (
    <Modal
      open={open}
      onClose={step === "processing" ? () => {} : onClose}
      title="Review your order"
      size="md"
      footer={
        step === "review" ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleBook} disabled={!items.length}>
              Pay {formatPrice(total)}
            </Button>
          </>
        ) : undefined
      }
    >
      {step === "processing" ? (
        <div className="flex flex-col items-center gap-4 py-8">
          <Spinner size="lg" />
          <p className="text-gray-600">Processing your booking…</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.ticketCategoryId}
              className="flex justify-between text-sm"
            >
              <span className="text-gray-700">
                {item.name} × {item.quantity}
              </span>
              <span className="font-medium">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-indigo-600">{formatPrice(total)}</span>
          </div>
          <p className="text-xs text-gray-400">
            Secure payment powered by Razorpay. You will be redirected to
            complete payment.
          </p>
        </div>
      )}
    </Modal>
  );
}
