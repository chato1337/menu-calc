from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ordering.application.use_cases import GenerateOrderUseCase
from ordering.domain.entities import OrderGenerationInput
from ordering.domain.services import OrderGenerationService
from ordering.infrastructure.repositories import (
    DjangoDayRepository,
    DjangoOrderRepository,
    DjangoProductQuantityRepository,
)
from ordering.models import AgeGroup, Day, Order, Product, ProductQuantity, Recipe

from .serializers import (
    AgeGroupSerializer,
    DaySerializer,
    GenerateOrderSerializer,
    OrderSerializer,
    ProductQuantitySerializer,
    ProductSerializer,
    RecipeSerializer,
)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("name")
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "category"]


class AgeGroupViewSet(viewsets.ModelViewSet):
    queryset = AgeGroup.objects.all().order_by("name")
    serializer_class = AgeGroupSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]


class ProductQuantityViewSet(viewsets.ModelViewSet):
    queryset = ProductQuantity.objects.select_related("product").prefetch_related("age_groups").all().order_by("product__name")
    serializer_class = ProductQuantitySerializer


class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.prefetch_related("products").all().order_by("name")
    serializer_class = RecipeSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "products__name"]


class DayViewSet(viewsets.ModelViewSet):
    queryset = Day.objects.prefetch_related("recipes").all().order_by("id")
    serializer_class = DaySerializer


class OrderViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    queryset = Order.objects.prefetch_related("products").all().order_by("-date", "name")
    serializer_class = OrderSerializer

    @action(detail=False, methods=["post"], url_path="generate")
    def generate(self, request):
        serializer = GenerateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        payload = OrderGenerationInput(**serializer.validated_data)
        use_case = GenerateOrderUseCase(
            quantity_reader=DjangoProductQuantityRepository(),
            order_writer=DjangoOrderRepository(),
            day_repository=DjangoDayRepository(),
            service=OrderGenerationService(),
        )

        try:
            order_id = use_case.execute(payload)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"order_id": order_id}, status=status.HTTP_201_CREATED)
