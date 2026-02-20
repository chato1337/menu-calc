from ordering.domain.entities import OrderGenerationInput
from ordering.domain.protocols import OrderWriter, ProductQuantityReader
from ordering.domain.services import OrderGenerationService
from ordering.infrastructure.repositories import DjangoDayRepository


class GenerateOrderUseCase:
    def __init__(
        self,
        quantity_reader: ProductQuantityReader,
        order_writer: OrderWriter,
        day_repository: DjangoDayRepository,
        service: OrderGenerationService,
    ) -> None:
        self._quantity_reader = quantity_reader
        self._order_writer = order_writer
        self._day_repository = day_repository
        self._service = service

    def execute(self, payload: OrderGenerationInput) -> int:
        if not self._day_repository.validate_ids(payload.day_ids):
            raise ValueError("Some day IDs do not exist")

        product_quantities = self._quantity_reader.list_by_day_ids(payload.day_ids, payload.product_category)
        if not product_quantities:
            raise ValueError("No product quantities found for the selected days")

        order_products = self._service.generate_order_products(payload, product_quantities)
        order_date = self._service.calculate_order_date(payload)
        return self._order_writer.create_order(payload, order_products, order_date)
