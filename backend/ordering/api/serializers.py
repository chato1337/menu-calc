from rest_framework import serializers

from ordering.models import AgeGroup, Day, Order, OrderProduct, Product, ProductQuantity, Recipe


class AgeGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgeGroup
        fields = ["id", "name", "quantity"]


class ProductQuantitySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    age_groups = serializers.PrimaryKeyRelatedField(queryset=AgeGroup.objects.all(), many=True)
    age_group_profiles = AgeGroupSerializer(source="age_groups", many=True, read_only=True)

    class Meta:
        model = ProductQuantity
        fields = [
            "id",
            "product",
            "product_name",
            "age_groups",
            "age_group_profiles",
            "unit_of_measure",
            "quantity",
            "package_type",
        ]


class ProductSerializer(serializers.ModelSerializer):
    quantities = ProductQuantitySerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ["id", "name", "category", "quantities"]


class ProductSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "category"]


class RecipeSerializer(serializers.ModelSerializer):
    products = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), many=True)
    product_details = ProductSummarySerializer(source="products", many=True, read_only=True)

    class Meta:
        model = Recipe
        fields = ["id", "name", "products", "product_details"]


class DaySerializer(serializers.ModelSerializer):
    recipes = serializers.PrimaryKeyRelatedField(queryset=Recipe.objects.all(), many=True)
    recipe_details = RecipeSerializer(source="recipes", many=True, read_only=True)

    class Meta:
        model = Day
        fields = ["id", "name", "recipes", "recipe_details"]


class OrderProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderProduct
        fields = ["id", "name", "package_type", "unit_of_measure", "quantity", "total", "qty_package", "detail"]


class OrderSerializer(serializers.ModelSerializer):
    products = OrderProductSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ["id", "name", "date", "products"]


class GenerateOrderSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    date = serializers.DateField()
    day_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
    )
