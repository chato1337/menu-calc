export interface AgeGroup {
  id: number;
  name: string;
  quantity: number;
}

export interface ProductQuantity {
  id: number;
  product: number;
  product_name: string;
  age_groups: number[];
  age_group_profiles: AgeGroup[];
  unit_of_measure: string;
  quantity: string;
  package_type: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  quantities: ProductQuantity[];
}

export interface ProductSummary {
  id: number;
  name: string;
  category: string;
}

export interface Recipe {
  id: number;
  name: string;
  products: number[];
  product_details: ProductSummary[];
}

export interface Day {
  id: number;
  name: string;
  recipes: number[];
  recipe_details: Recipe[];
}

export interface OrderProduct {
  id: number;
  name: string;
  package_type: string;
  unit_of_measure: string;
  quantity: string;
  total: number;
  qty_package: number;
  detail: string;
}

export interface Order {
  id: number;
  name: string;
  date: string;
  products: OrderProduct[];
}

export interface GenerateOrderPayload {
  name: string;
  date: string;
  day_ids: number[];
}

export interface ProductPayload {
  name: string;
  category: string;
}

export interface ProductQuantityPayload {
  product: number;
  age_groups: number[];
  unit_of_measure: string;
  quantity: string;
  package_type: string;
}

export interface AgeGroupPayload {
  name: string;
  quantity: number;
}

export interface RecipePayload {
  name: string;
  products: number[];
}

export interface DayPayload {
  name: string;
  recipes: number[];
}
