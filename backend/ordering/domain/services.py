from collections import defaultdict
from decimal import ROUND_CEILING, Decimal, InvalidOperation

from .entities import OrderGenerationInput, OrderProductData, ProductQuantityData


class OrderGenerationService:
    @staticmethod
    def _parse_package_size(raw_value: str) -> Decimal:
        try:
            package_size = Decimal(raw_value)
        except (InvalidOperation, ValueError):
            raise ValueError(f"Invalid package_type value '{raw_value}'. It must be a positive number.")

        if package_size <= 0:
            raise ValueError(f"Invalid package_type value '{raw_value}'. It must be greater than zero.")
        return package_size

    def generate_order_products(
        self,
        payload: OrderGenerationInput,
        product_quantities: list[ProductQuantityData],
    ) -> list[OrderProductData]:
        if not payload.day_ids:
            raise ValueError("At least one day must be selected")

        totals: dict[tuple[str, str, str], Decimal] = defaultdict(lambda: Decimal("0"))
        details: dict[tuple[str, str, str], list[str]] = defaultdict(list)

        for quantity_data in product_quantities:
            key = (
                quantity_data.product_name,
                quantity_data.package_type,
                quantity_data.unit_of_measure,
            )

            if not quantity_data.age_groups:
                totals[key] += Decimal("0")
                details[key].append(
                    f"Sin grupos etarios: {quantity_data.quantity} x 0 = 0"
                )
                continue

            for age_group in quantity_data.age_groups:
                partial_total = quantity_data.quantity * Decimal(age_group.quantity)
                totals[key] += partial_total
                details[key].append(
                    f"{quantity_data.quantity} x {age_group.quantity} ({age_group.name}) = {partial_total.quantize(Decimal('0.01'))}"
                )

        return [
            self._build_order_product_data(name, package_type, unit, amount, details[(name, package_type, unit)])
            for (name, package_type, unit), amount in sorted(totals.items())
        ]

    def calculate_order_date(self, payload: OrderGenerationInput):
        return payload.date

    def _build_order_product_data(
        self,
        name: str,
        package_type: str,
        unit: str,
        amount: Decimal,
        detail_lines: list[str],
    ) -> OrderProductData:
        quantized_amount = amount.quantize(Decimal("0.01"))
        total = int(quantized_amount.to_integral_value(rounding=ROUND_CEILING))
        package_size = self._parse_package_size(package_type)
        qty_package_decimal = (Decimal(total) / package_size).to_integral_value(rounding=ROUND_CEILING)
        qty_package = int(qty_package_decimal)

        detail = "\n".join(
            [
                *detail_lines,
                f"Total = {quantized_amount}",
                f"Qty package = ceil({total} / {package_size}) = {qty_package}",
            ]
        )

        return OrderProductData(
            name=name,
            package_type=package_type,
            unit_of_measure=unit,
            quantity=quantized_amount,
            total=total,
            qty_package=qty_package,
            detail=detail,
        )
