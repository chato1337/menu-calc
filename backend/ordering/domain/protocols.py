from datetime import date
from typing import Protocol

from .entities import OrderGenerationInput, OrderProductData, ProductQuantityData


class ProductQuantityReader(Protocol):
    def list_by_day_ids(self, day_ids: list[int]) -> list[ProductQuantityData]:
        ...


class OrderWriter(Protocol):
    def create_order(
        self,
        payload: OrderGenerationInput,
        products: list[OrderProductData],
        order_date: date,
    ) -> int:
        ...
