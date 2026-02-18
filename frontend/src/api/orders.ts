import { apiClient } from "./client";
import { PaginatedResponse } from "../types/api";
import { Day, GenerateOrderPayload, Order } from "../types/domain";

interface ListParams {
  limit: number;
  offset: number;
}

function toQuery(params: ListParams): string {
  const query = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  return `?${query.toString()}`;
}

export async function getDaysForSelection(): Promise<Day[]> {
  const response = await apiClient.get<PaginatedResponse<Day>>("/days/?limit=200&offset=0");
  return response.results;
}

export async function getOrders(params: ListParams): Promise<PaginatedResponse<Order>> {
  return apiClient.get<PaginatedResponse<Order>>(`/orders/${toQuery(params)}`);
}

export async function generateOrder(payload: GenerateOrderPayload): Promise<{ order_id: number }> {
  return apiClient.post<{ order_id: number }>("/orders/generate/", payload);
}

export async function deleteOrder(id: number): Promise<void> {
  return apiClient.delete(`/orders/${id}/`);
}
