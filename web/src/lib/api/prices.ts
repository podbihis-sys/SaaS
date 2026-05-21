import { api } from "./client";
import type { PriceItem, PriceItemWrite, PriceList, UUID } from "./types";

export const pricesApi = {
  listItems: (params: { list_id?: UUID; search?: string } = {}) =>
    api.get<PriceItem[]>("/api/v1/prices/items", { query: { ...params } }),
  createItem: (input: PriceItemWrite) =>
    api.post<PriceItem>("/api/v1/prices/items", input),
  createItemsBulk: (items: PriceItemWrite[]) =>
    api.post<PriceItem[]>("/api/v1/prices/items", items),
  updateItem: (id: UUID, input: Partial<PriceItemWrite>) =>
    api.patch<PriceItem>(`/api/v1/prices/items/${id}`, input),
  deleteItem: (id: UUID) => api.delete<void>(`/api/v1/prices/items/${id}`),
  listLists: () => api.get<PriceList[]>("/api/v1/prices/lists"),
  createList: (input: { name: string; is_default?: boolean }) =>
    api.post<PriceList>("/api/v1/prices/lists", input),
};
