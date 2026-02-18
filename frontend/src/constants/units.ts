export interface UnitOption {
  value: string;
  labelKey: string;
}

export const FOOD_UNIT_OPTIONS: UnitOption[] = [
  { value: "g", labelKey: "units.g" },
  { value: "kg", labelKey: "units.kg" },
  { value: "ml", labelKey: "units.ml" },
  { value: "l", labelKey: "units.l" },
  { value: "unit", labelKey: "units.unit" },
  { value: "tbsp", labelKey: "units.tbsp" },
  { value: "tsp", labelKey: "units.tsp" },
];
