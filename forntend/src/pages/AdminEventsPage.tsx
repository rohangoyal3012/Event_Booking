import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  Badge,
  Pagination,
  Modal,
  FullPageSpinner,
} from "@/components/ui";
import { eventsService } from "@/services/events.service";
import { queryKeys } from "@/lib/queryClient";
import { ROUTES } from "@/utils/constants";
import { formatDate, formatPrice } from "@/utils/format";
import toast from "react-hot-toast";

export default function AdminEventsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.events.list({ page, limit: 15, admin: true }),
    queryFn: () => eventsService.getAll({ page, limit: 15 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsService.updateStatus(id, "CANCELLED"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.events.all });
      setDeleteId(null);
      toast.success("Event cancelled");
    },
    onError: () => toast.error("Failed to cancel event"),
  });

  const statusColors: Record<string, string> = {
    DRAFT: "gray",
    PUBLISHED: "green",
    CANCELLED: "red",
    COMPLETED: "blue",
  };

  if (isLoading) return <FullPageSpinner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <Button>
          <Link
            to={ROUTES.ADMIN.CREATE_EVENT}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Event", "Date", "Seats", "Price", "Status", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.data.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 max-w-xs">
                  <p className="truncate font-medium text-gray-900">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-400">{event.city}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                  {formatDate(event.startDate)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                  {event.availableSeats}/{event.totalSeats}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                  {event.isFree ? "Free" : formatPrice(event.minPrice)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge
                    color={
                      statusColors[event.status] as
                        | "gray"
                        | "green"
                        | "red"
                        | "blue"
                    }
                  >
                    {event.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Link to={ROUTES.EVENT_DETAIL(event.slug)}>
                      <Button variant="ghost" size="xs">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to={ROUTES.ADMIN.EDIT_EVENT(event.id)}>
                      <Button variant="ghost" size="xs">
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                    {event.status !== "CANCELLED" && (
                      <Button
                        variant="ghost"
                        size="xs"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => setDeleteId(event.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.meta.pages > 1 && (
        <div className="mt-6">
          <Pagination
            page={data.meta.page}
            pages={data.meta.pages}
            total={data.meta.total}
            limit={data.meta.limit}
            onPageChange={setPage}
          />
        </div>
      )}

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Cancel Event"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>
              Go back
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Cancel Event
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          This will cancel the event and notify all attendees. This action
          cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
