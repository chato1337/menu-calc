from dataclasses import dataclass
from datetime import date
from decimal import Decimal


@dataclass(frozen=True)
class AgeGroupData:
    name: str
    quantity: int


@dataclass(frozen=True)
class ProductQuantityData:
    product_name: str
    unit_of_measure: str
    package_type: str
    quantity: Decimal
    age_groups: list[AgeGroupData]


@dataclass(frozen=True)
class OrderProductData:
    name: str
    package_type: str
    unit_of_measure: str
    quantity: Decimal
    total: int
    qty_package: int
    detail: str


@dataclass(frozen=True)
class OrderGenerationInput:
    name: str
    date: date
    day_ids: list[int]

