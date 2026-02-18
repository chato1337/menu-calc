from datetime import date

from django.db.models import QuerySet

from ordering.domain.entities import AgeGroupData, OrderGenerationInput, OrderProductData, ProductQuantityData
from ordering.models import Day, Order, OrderProduct, ProductQuantity


class DjangoProductQuantityRepository:
    def list_by_day_ids(self, day_ids: list[int]) -> list[ProductQuantityData]:
        quantities: QuerySet[ProductQuantity] = ProductQuantity.objects.filter(
            product__recipes__days__id__in=day_ids
        ).select_related("product").prefetch_related("age_groups")

        return [
            ProductQuantityData(
                product_name=quantity.product.name,
                unit_of_measure=quantity.unit_of_measure,
                package_type=quantity.package_type,
                quantity=quantity.quantity,
                age_groups=[
                    AgeGroupData(name=age_group.name, quantity=age_group.quantity)
                    for age_group in quantity.age_groups.all()
                ],
            )
            for quantity in quantities
        ]


class DjangoOrderRepository:
    def create_order(
        self,
        payload: OrderGenerationInput,
        products: list[OrderProductData],
        order_date: date,
    ) -> int:
        order = Order.objects.create(name=payload.name, date=order_date)
        OrderProduct.objects.bulk_create(
            [
                OrderProduct(
                    order=order,
                    name=item.name,
                    package_type=item.package_type,
                    unit_of_measure=item.unit_of_measure,
                    quantity=item.quantity,
                    total=item.total,
                    qty_package=item.qty_package,
                    detail=item.detail,
                )
                for item in products
            ]
        )
        return order.id


class DjangoDayRepository:
    def validate_ids(self, day_ids: list[int]) -> bool:
        existing_count = Day.objects.filter(id__in=day_ids).count()
        return existing_count == len(set(day_ids))
