import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FullPageSpinner, Pagination, Modal, Button } from "@/components/ui";
import BookingCard, {
  type BookingSummary,
} from "@/features/bookings/BookingCard";
import { bookingsService, ticketsService } from "@/services/bookings.service";
import { queryKeys } from "@/lib/queryClient";
import { DEFAULT_PAGE_SIZE } from "@/utils/constants";
import toast from "react-hot-toast";

export default function MyBookingsPage() {
  const [page, setPage] = useState(1);
  const [ticketsBookingId, setTicketsBookingId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.bookings.mine({ page, limit: DEFAULT_PAGE_SIZE }),
    queryFn: () => bookingsService.getMine({ page, limit: DEFAULT_PAGE_SIZE }),
  });

  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ["tickets", ticketsBookingId],
    queryFn: () => ticketsService.getByBooking(ticketsBookingId!),
    enabled: !!ticketsBookingId,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingsService.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bookings.all });
      setCancelId(null);
      toast.success("Booking cancelled successfully");
    },
    onError: () => toast.error("Failed to cancel booking"),
  });

  if (isLoading) return <FullPageSpinner />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Bookings</h1>

      {data?.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <p className="text-xl font-medium">No bookings yet</p>
          <p className="text-sm mt-1">
            Start exploring events and book your first ticket!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.data.map((booking: BookingSummary) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onViewTickets={(id) => setTicketsBookingId(id)}
              onCancel={(id) => setCancelId(id)}
            />
          ))}
        </div>
      )}

      {data && data.meta.pages > 1 && (
        <div className="mt-8">
          <Pagination
            page={data.meta.page}
            pages={data.meta.pages}
            total={data.meta.total}
            limit={data.meta.limit}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Tickets modal */}
      <Modal
        open={!!ticketsBookingId}
        onClose={() => setTicketsBookingId(null)}
        title="Your Tickets"
        size="lg"
      >
        {ticketsLoading ? (
          <FullPageSpinner label="Loading tickets…" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {tickets?.map(
              (ticket: {
                id: string;
                ticketCode: string;
                qrCodeUrl: string;
                ticketCategoryName: string;
                status: string;
              }) => (
                <div
                  key={ticket.id}
                  className="flex flex-col items-center rounded-xl border border-gray-200 p-4"
                >
                  <img
                    src={ticket.qrCodeUrl}
                    alt={`QR for ${ticket.ticketCode}`}
                    className="h-40 w-40 object-contain"
                  />
                  <p className="mt-3 font-mono text-sm font-semibold text-gray-700">
                    {ticket.ticketCode}
                  </p>
                  <p className="text-xs text-gray-500">
                    {ticket.ticketCategoryName}
                  </p>
                </div>
              ),
            )}
          </div>
        )}
      </Modal>

      {/* Cancel confirmation modal */}
      <Modal
        open={!!cancelId}
        onClose={() => setCancelId(null)}
        title="Cancel Booking"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelId(null)}>
              Keep it
            </Button>
            <Button
              variant="danger"
              loading={cancelMutation.isPending}
              onClick={() => cancelId && cancelMutation.mutate(cancelId)}
            >
              Yes, cancel
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to cancel this booking? If eligible, a refund
          will be processed within 5–7 business days.
        </p>
      </Modal>
    </div>
  );
}
