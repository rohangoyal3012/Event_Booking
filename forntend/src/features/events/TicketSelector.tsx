import { useState } from "react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui";
import { formatPrice } from "@/utils/format";
import { MAX_TICKET_QUANTITY } from "@/utils/constants";
import { useCartStore } from "@/store/cartStore";

export interface TicketCategoryInfo {
  id: string;
  name: string;
  description: string | null;
  price: number;
  availableQuantity: number;
  maxPerBooking: number;
}

interface TicketSelectorProps {
  eventId: string;
  categories: TicketCategoryInfo[];
}

export default function TicketSelector({
  eventId,
  categories,
}: TicketSelectorProps) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();

  const getQty = (categoryId: string) =>
    items.find((i) => i.ticketCategoryId === categoryId)?.quantity ?? 0;

  const handleAdd = (cat: TicketCategoryInfo) => {
    const current = getQty(cat.id);
    if (current === 0) {
      addItem({
        eventId,
        ticketCategoryId: cat.id,
        name: cat.name,
        price: cat.price,
        quantity: 1,
        maxQuantity: Math.min(
          cat.maxPerBooking,
          cat.availableQuantity,
          MAX_TICKET_QUANTITY,
        ),
      });
    } else {
      updateQuantity(cat.id, current + 1);
    }
  };

  const handleRemove = (cat: TicketCategoryInfo) => {
    const current = getQty(cat.id);
    if (current === 1) {
      removeItem(cat.id);
    } else {
      updateQuantity(cat.id, current - 1);
    }
  };

  if (categories.length === 0) {
    return (
      <p className="text-sm text-gray-500">No ticket categories available.</p>
    );
  }

  return (
    <div className="space-y-3">
      {categories.map((cat) => {
        const qty = getQty(cat.id);
        const maxQty = Math.min(
          cat.maxPerBooking,
          cat.availableQuantity,
          MAX_TICKET_QUANTITY,
        );
        const soldOut = cat.availableQuantity === 0;

        return (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{cat.name}</span>
                {soldOut && <Badge color="red">Sold out</Badge>}
              </div>
              {cat.description && (
                <p className="mt-0.5 text-sm text-gray-500">
                  {cat.description}
                </p>
              )}
              <p className="mt-1 text-base font-semibold text-indigo-600">
                {cat.price === 0 ? "Free" : formatPrice(cat.price)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!soldOut && (
                <>
                  <button
                    disabled={qty === 0}
                    onClick={() => handleRemove(cat)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 disabled:opacity-40 hover:border-indigo-400 hover:bg-indigo-50"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center text-base font-semibold">
                    {qty}
                  </span>
                  <button
                    disabled={qty >= maxQty}
                    onClick={() => handleAdd(cat)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 disabled:opacity-40 hover:border-indigo-400 hover:bg-indigo-50"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
