import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Input, Button, FullPageSpinner } from "@/components/ui";
import { eventsService } from "@/services/events.service";
import { queryKeys } from "@/lib/queryClient";
import { ROUTES, EVENT_CATEGORIES } from "@/utils/constants";
import toast from "react-hot-toast";

const ticketSchema = z.object({
  name: z.string().min(1, "Required"),
  price: z.coerce.number().min(0),
  totalQuantity: z.coerce.number().min(1),
  maxPerBooking: z.coerce.number().min(1).max(10),
  description: z.string().optional(),
});

const schema = z.object({
  title: z.string().min(5, "At least 5 characters"),
  description: z.string().min(20, "At least 20 characters"),
  category: z.string().min(1, "Required"),
  startDate: z.string().min(1, "Required"),
  endDate: z.string().min(1, "Required"),
  venueName: z.string().min(2, "Required"),
  venueAddress: z.string().min(5, "Required"),
  city: z.string().min(2, "Required"),
  state: z.string().min(2, "Required"),
  country: z.string().default("India"),
  totalSeats: z.coerce.number().min(1),
  ticketCategories: z
    .array(ticketSchema)
    .min(1, "At least one ticket category is required"),
});

type FormData = z.infer<typeof schema>;

interface EventFormPageProps {
  mode: "create" | "edit";
}

export default function EventFormPage({ mode }: EventFormPageProps) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { id } = useParams<{ id: string }>();

  const { data: existingEvent, isLoading: loadingEvent } = useQuery({
    queryKey: ["admin-event", id],
    queryFn: () => eventsService.getById(id!),
    enabled: mode === "edit" && !!id,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: existingEvent
      ? {
          ...existingEvent,
          startDate: existingEvent.startDate?.slice(0, 16),
          endDate: existingEvent.endDate?.slice(0, 16),
        }
      : {
          country: "India",
          ticketCategories: [
            { name: "General", price: 0, totalQuantity: 100, maxPerBooking: 5 },
          ],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ticketCategories",
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      mode === "create"
        ? eventsService.create(data)
        : eventsService.update(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.events.all });
      toast.success(`Event ${mode === "create" ? "created" : "updated"}!`);
      navigate(ROUTES.ADMIN.EVENTS);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to save event";
      toast.error(message);
    },
  });

  if (mode === "edit" && loadingEvent) return <FullPageSpinner />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        {mode === "create" ? "Create Event" : "Edit Event"}
      </h1>

      <form
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        className="space-y-8"
      >
        {/* Basic Info */}
        <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">
            Basic Information
          </h2>
          <Input
            label="Event title"
            error={errors.title?.message}
            {...register("title")}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              rows={5}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register("category")}
            >
              <option value="">Select category</option>
              {EVENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-red-500">
                {errors.category.message}
              </p>
            )}
          </div>
        </section>

        {/* Date & Location */}
        <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">
            Date & Location
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start date & time"
              type="datetime-local"
              error={errors.startDate?.message}
              {...register("startDate")}
            />
            <Input
              label="End date & time"
              type="datetime-local"
              error={errors.endDate?.message}
              {...register("endDate")}
            />
          </div>
          <Input
            label="Venue name"
            error={errors.venueName?.message}
            {...register("venueName")}
          />
          <Input
            label="Venue address"
            error={errors.venueAddress?.message}
            {...register("venueAddress")}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              error={errors.city?.message}
              {...register("city")}
            />
            <Input
              label="State"
              error={errors.state?.message}
              {...register("state")}
            />
          </div>
          <Input
            label="Total seats"
            type="number"
            error={errors.totalSeats?.message}
            {...register("totalSeats")}
          />
        </section>

        {/* Ticket Categories */}
        <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              Ticket Categories
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  name: "",
                  price: 0,
                  totalQuantity: 50,
                  maxPerBooking: 5,
                })
              }
            >
              <PlusIcon className="h-4 w-4" />
              Add tier
            </Button>
          </div>
          {errors.ticketCategories?.root && (
            <p className="text-xs text-red-500">
              {errors.ticketCategories.root.message}
            </p>
          )}
          {fields.map((field, i) => (
            <div
              key={field.id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Tier {i + 1}
                </span>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => remove(i)}
                  >
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Name"
                  error={errors.ticketCategories?.[i]?.name?.message}
                  {...register(`ticketCategories.${i}.name`)}
                />
                <Input
                  label="Price (₹)"
                  type="number"
                  error={errors.ticketCategories?.[i]?.price?.message}
                  {...register(`ticketCategories.${i}.price`)}
                />
                <Input
                  label="Total quantity"
                  type="number"
                  error={errors.ticketCategories?.[i]?.totalQuantity?.message}
                  {...register(`ticketCategories.${i}.totalQuantity`)}
                />
                <Input
                  label="Max per booking"
                  type="number"
                  error={errors.ticketCategories?.[i]?.maxPerBooking?.message}
                  {...register(`ticketCategories.${i}.maxPerBooking`)}
                />
              </div>
            </div>
          ))}
        </section>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(ROUTES.ADMIN.EVENTS)}
          >
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending || isSubmitting}>
            {mode === "create" ? "Create Event" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
