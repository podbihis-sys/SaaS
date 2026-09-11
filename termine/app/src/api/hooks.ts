import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { request } from './client';
import type {
  AppNotification,
  Booking,
  BookingStatus,
  Category,
  Office,
  Page,
  Place,
  PlaceDetail,
  ServiceCategory,
  Slot,
  Watch,
  WatchCreate,
  WatchDetail,
  WatchUpdate,
} from './types';

export const queryKeys = {
  categories: ['categories'] as const,
  offices: (params: OfficeSearch) => ['offices', params] as const,
  office: (id: string) => ['office', id] as const,
  places: (q: string) => ['places', q] as const,
  place: (ags: string) => ['place', ags] as const,
  slots: (params: SlotSearch) => ['slots', params] as const,
  watches: ['watches'] as const,
  watch: (id: string) => ['watch', id] as const,
  notifications: ['notifications'] as const,
  bookings: ['bookings'] as const,
};

export interface OfficeSearch {
  q?: string;
  city?: string;
  category?: ServiceCategory;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
}

export interface SlotSearch {
  office_id?: string[];
  category?: ServiceCategory;
  service_id?: string;
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => request<Category[]>('/api/v1/offices/categories', { anonymous: true }),
    // The catalogue changes when an authority is added, not minute to minute.
    staleTime: 60 * 60 * 1000,
  });
}

export function useOffices(params: OfficeSearch, enabled = true) {
  return useQuery({
    queryKey: queryKeys.offices(params),
    queryFn: () =>
      request<Page<Office>>('/api/v1/offices', {
        anonymous: true,
        query: { ...params, limit: 50 },
      }),
    enabled,
    staleTime: 10 * 60 * 1000,
  });
}

export function useOffice(id: string) {
  return useQuery({
    queryKey: queryKeys.office(id),
    queryFn: () => request<Office>(`/api/v1/offices/${id}`, { anonymous: true }),
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Postcode or town name → municipalities. Runs from two characters on; the
 * register answers instantly, only an unseen postcode costs a lookup.
 */
export function usePlaces(q: string) {
  const query = q.trim();
  return useQuery({
    queryKey: queryKeys.places(query),
    queryFn: () =>
      request<Place[]>('/api/v1/places', { anonymous: true, query: { q: query, limit: 8 } }),
    enabled: query.length >= 2,
    staleTime: 60 * 60 * 1000,
  });
}

export function usePlace(ags: string) {
  return useQuery({
    queryKey: queryKeys.place(ags),
    queryFn: () => request<PlaceDetail>(`/api/v1/places/${ags}`, { anonymous: true }),
    staleTime: 10 * 60 * 1000,
  });
}

export function useSlots(params: SlotSearch, enabled = true) {
  return useQuery({
    queryKey: queryKeys.slots(params),
    queryFn: () => request<Slot[]>('/api/v1/slots', { anonymous: true, query: { ...params } }),
    enabled,
    // Availability is the one thing that genuinely goes stale in seconds.
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useWatches() {
  return useQuery({
    queryKey: queryKeys.watches,
    queryFn: () => request<Watch[]>('/api/v1/watches'),
  });
}

export function useWatch(id: string) {
  return useQuery({
    queryKey: queryKeys.watch(id),
    queryFn: () => request<WatchDetail>(`/api/v1/watches/${id}`),
    refetchInterval: 60 * 1000,
  });
}

export function useCreateWatch() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: WatchCreate) =>
      request<Watch>('/api/v1/watches', { method: 'POST', body: payload }),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.watches }),
  });
}

export function useUpdateWatch(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: WatchUpdate) =>
      request<Watch>(`/api/v1/watches/${id}`, { method: 'PATCH', body: payload }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.watches });
      void client.invalidateQueries({ queryKey: queryKeys.watch(id) });
    },
  });
}

export function useDeleteWatch() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => request<void>(`/api/v1/watches/${id}`, { method: 'DELETE' }),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.watches }),
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => request<AppNotification[]>('/api/v1/notifications'),
  });
}

export function useMarkNotificationRead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      request<AppNotification>(`/api/v1/notifications/${id}/read`, { method: 'POST' }),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}

export function useCreateBooking() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: { slot_id: string; watch_id?: string }) =>
      request<Booking>('/api/v1/bookings', { method: 'POST', body: payload }),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.bookings }),
  });
}

export function useResolveBooking() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: BookingStatus; note?: string }) =>
      request<Booking>(`/api/v1/bookings/${id}/resolve`, {
        method: 'POST',
        body: { status, note: note ?? null },
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.bookings });
      void client.invalidateQueries({ queryKey: queryKeys.watches });
    },
  });
}

export function registerPushToken(pushToken: string, platform: 'ios' | 'android' | 'web') {
  return request('/api/v1/auth/devices', {
    method: 'POST',
    body: { push_token: pushToken, platform, locale: 'de' },
  });
}
