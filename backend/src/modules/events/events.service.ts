import { eventsRepository } from "./events.repository";
import {
  CreateEventDto,
  UpdateEventDto,
  EventQueryDto,
} from "./events.validator";
import { AppError } from "../../utils/AppError";
import { uniqueSlug } from "../../utils/slugify";
import {
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  CacheKeys,
  TTL,
} from "../../config/redis";
import { cloudinary, CLOUDINARY_FOLDERS } from "../../config/cloudinary";
import { meiliClient, MEILI_INDEXES } from "../../config/meilisearch";
import { paginatedResponse } from "../../utils/pagination";
import { EventStatus } from "../../types";

export const eventsService = {
  async getAll(query: EventQueryDto, userId?: string) {
    const cacheKey = CacheKeys.eventList(query.page, JSON.stringify(query));
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const { events, total } = await eventsRepository.findAll({
      ...query,
      status: (query.status as EventStatus) ?? "PUBLISHED",
    });

    const result = paginatedResponse(events, query.page, query.limit, total);
    await setCache(cacheKey, result, TTL.eventList);
    return result;
  },

  async getBySlug(slug: string) {
    const cacheKey = CacheKeys.eventSlug(slug);
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const event = await eventsRepository.findBySlug(slug);
    if (!event) throw AppError.notFound("Event");

    await setCache(cacheKey, event, TTL.event);
    return event;
  },

  async getById(id: string) {
    const cacheKey = CacheKeys.event(id);
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const event = await eventsRepository.findById(id);
    if (!event) throw AppError.notFound("Event");

    await setCache(cacheKey, event, TTL.event);
    return event;
  },

  async create(organizerId: string, dto: CreateEventDto) {
    const slug = uniqueSlug(dto.title);
    const { ticketCategories, dateStart, dateEnd, ...rest } = dto;

    const categories = ticketCategories.map((tc) => ({
      name: tc.name,
      description: tc.description,
      price: tc.price,
      totalQuantity: tc.totalQuantity,
      availableQuantity: tc.totalQuantity,
      maxPerBooking: tc.maxPerBooking,
      saleStartsAt: tc.saleStartsAt ? new Date(tc.saleStartsAt) : null,
      saleEndsAt: tc.saleEndsAt ? new Date(tc.saleEndsAt) : null,
    }));

    const event = await eventsRepository.create(organizerId, {
      ...rest,
      slug,
      dateStart: new Date(dateStart),
      dateEnd: new Date(dateEnd),
      ticketCategories: categories,
    } as Parameters<typeof eventsRepository.create>[1]);

    await deleteCachePattern("events:list:*");
    await eventsService._indexToMeilisearch(event);

    return event;
  },

  async update(
    id: string,
    organizerId: string,
    dto: UpdateEventDto,
    isAdmin = false,
  ) {
    const existing = await eventsRepository.findById(id);
    if (!existing) throw AppError.notFound("Event");

    if (!isAdmin && existing.organizerId !== organizerId) {
      throw AppError.forbidden("Not authorized to edit this event");
    }

    const updateData: Record<string, unknown> = { ...dto };
    if (dto.dateStart) updateData.dateStart = new Date(dto.dateStart);
    if (dto.dateEnd) updateData.dateEnd = new Date(dto.dateEnd);

    const updated = await eventsRepository.update(id, updateData);

    await Promise.all([
      deleteCache(CacheKeys.event(id), CacheKeys.eventSlug(existing.slug)),
      deleteCachePattern("events:list:*"),
    ]);
    await eventsService._indexToMeilisearch(updated);

    return updated;
  },

  async updateStatus(
    id: string,
    organizerId: string,
    status: "PUBLISHED" | "CANCELLED" | "DRAFT" | "COMPLETED",
    cancellationNote?: string,
    isAdmin = false,
  ) {
    const existing = await eventsRepository.findById(id);
    if (!existing) throw AppError.notFound("Event");

    if (!isAdmin && existing.organizerId !== organizerId) {
      throw AppError.forbidden("Not authorized");
    }

    const updated = await eventsRepository.updateStatus(
      id,
      status,
      cancellationNote,
    );
    await Promise.all([
      deleteCache(CacheKeys.event(id), CacheKeys.eventSlug(existing.slug)),
      deleteCachePattern("events:list:*"),
    ]);

    return updated;
  },

  async uploadBanner(
    id: string,
    organizerId: string,
    buffer: Buffer,
    mimetype: string,
  ) {
    const event = await eventsRepository.findById(id);
    if (!event) throw AppError.notFound("Event");
    if (event.organizerId !== organizerId) throw AppError.forbidden();

    const base64 = `data:${mimetype};base64,${buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64, {
      folder: CLOUDINARY_FOLDERS.eventBanners,
      public_id: `banner_${id}`,
      overwrite: true,
      transformation: [{ width: 1200, height: 630, crop: "fill" }],
    });

    const updated = await eventsRepository.updateBanner(id, result.secure_url);
    await deleteCache(CacheKeys.event(id), CacheKeys.eventSlug(event.slug));

    return updated;
  },

  async getFeatured() {
    return eventsRepository.getFeatured();
  },

  async getCategories() {
    return eventsRepository.getCategories();
  },

  async _indexToMeilisearch(event: Record<string, unknown>) {
    try {
      await meiliClient.index(MEILI_INDEXES.events).addDocuments([
        {
          id: event.id,
          title: event.title,
          description: event.description,
          category: event.category,
          city: event.city,
          tags: event.tags,
          status: event.status,
          dateStart: event.dateStart,
          availableSeats: event.availableSeats,
          isFeatured: event.isFeatured,
        },
      ]);
    } catch {
      // Non-critical, do not throw
    }
  },
};
