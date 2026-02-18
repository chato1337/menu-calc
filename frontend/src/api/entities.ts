import { apiClient } from "./client";
import { PaginatedResponse } from "../types/api";
import {
  AgeGroup,
  AgeGroupPayload,
  Day,
  DayPayload,
  Product,
  ProductPayload,
  ProductQuantity,
  ProductQuantityPayload,
  Recipe,
  RecipePayload,
} from "../types/domain";

interface ListParams {
  limit: number;
  offset: number;
  search?: string;
}

function toQuery(params: ListParams): string {
  const query = new URLSearchParams();
  query.set("limit", String(params.limit));
  query.set("offset", String(params.offset));
  if (params.search && params.search.trim() !== "") {
    query.set("search", params.search.trim());
  }
  return `?${query.toString()}`;
}

export function listProducts(params: ListParams): Promise<PaginatedResponse<Product>> {
  return apiClient.get<PaginatedResponse<Product>>(`/products/${toQuery(params)}`);
}

export function createProduct(payload: ProductPayload): Promise<Product> {
  return apiClient.post<Product>("/products/", payload);
}

export function updateProduct(id: number, payload: ProductPayload): Promise<Product> {
  return apiClient.put<Product>(`/products/${id}/`, payload);
}

export function deleteProduct(id: number): Promise<void> {
  return apiClient.delete(`/products/${id}/`);
}

export function listAgeGroups(params: ListParams): Promise<PaginatedResponse<AgeGroup>> {
  return apiClient.get<PaginatedResponse<AgeGroup>>(`/age-groups/${toQuery(params)}`);
}

export function createAgeGroup(payload: AgeGroupPayload): Promise<AgeGroup> {
  return apiClient.post<AgeGroup>("/age-groups/", payload);
}

export function updateAgeGroup(id: number, payload: AgeGroupPayload): Promise<AgeGroup> {
  return apiClient.put<AgeGroup>(`/age-groups/${id}/`, payload);
}

export function deleteAgeGroup(id: number): Promise<void> {
  return apiClient.delete(`/age-groups/${id}/`);
}

export function listProductQuantities(params: ListParams): Promise<PaginatedResponse<ProductQuantity>> {
  return apiClient.get<PaginatedResponse<ProductQuantity>>(`/product-quantities/${toQuery(params)}`);
}

export function createProductQuantity(payload: ProductQuantityPayload): Promise<ProductQuantity> {
  return apiClient.post<ProductQuantity>("/product-quantities/", payload);
}

export function updateProductQuantity(
  id: number,
  payload: ProductQuantityPayload
): Promise<ProductQuantity> {
  return apiClient.put<ProductQuantity>(`/product-quantities/${id}/`, payload);
}

export function deleteProductQuantity(id: number): Promise<void> {
  return apiClient.delete(`/product-quantities/${id}/`);
}

export function listRecipes(params: ListParams): Promise<PaginatedResponse<Recipe>> {
  return apiClient.get<PaginatedResponse<Recipe>>(`/recipes/${toQuery(params)}`);
}

export function createRecipe(payload: RecipePayload): Promise<Recipe> {
  return apiClient.post<Recipe>("/recipes/", payload);
}

export function updateRecipe(id: number, payload: RecipePayload): Promise<Recipe> {
  return apiClient.put<Recipe>(`/recipes/${id}/`, payload);
}

export function deleteRecipe(id: number): Promise<void> {
  return apiClient.delete(`/recipes/${id}/`);
}

export function listDays(params: ListParams): Promise<PaginatedResponse<Day>> {
  return apiClient.get<PaginatedResponse<Day>>(`/days/${toQuery(params)}`);
}

export function createDay(payload: DayPayload): Promise<Day> {
  return apiClient.post<Day>("/days/", payload);
}

export function updateDay(id: number, payload: DayPayload): Promise<Day> {
  return apiClient.put<Day>(`/days/${id}/`, payload);
}

export function deleteDay(id: number): Promise<void> {
  return apiClient.delete(`/days/${id}/`);
}
