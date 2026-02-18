from django.db import models


class Product(models.Model):
    name = models.CharField(max_length=120, unique=True)
    category = models.CharField(max_length=80)

    def __str__(self) -> str:
        return self.name


class AgeGroup(models.Model):
    name = models.CharField(max_length=50, unique=True)
    quantity = models.PositiveIntegerField()

    def __str__(self) -> str:
        return f"{self.name} ({self.quantity})"


class ProductQuantity(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="quantities")
    age_groups = models.ManyToManyField(AgeGroup, related_name="product_quantities", blank=True)
    unit_of_measure = models.CharField(max_length=20)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    package_type = models.CharField(max_length=50)

    class Meta:
        unique_together = ("product", "unit_of_measure", "package_type", "quantity")

    def __str__(self) -> str:
        return f"{self.product.name} - {self.quantity} {self.unit_of_measure}"


class Recipe(models.Model):
    name = models.CharField(max_length=120, unique=True)
    products = models.ManyToManyField(Product, related_name="recipes", blank=True)

    def __str__(self) -> str:
        return self.name


class Day(models.Model):
    name = models.CharField(max_length=50, unique=True)
    recipes = models.ManyToManyField(Recipe, related_name="days", blank=True)

    def __str__(self) -> str:
        return self.name


class Order(models.Model):
    name = models.CharField(max_length=120)
    date = models.DateField()

    def __str__(self) -> str:
        return f"{self.name} ({self.date})"


class OrderProduct(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=120)
    package_type = models.CharField(max_length=50)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_of_measure = models.CharField(max_length=20)
    total = models.PositiveIntegerField(default=0)
    qty_package = models.PositiveIntegerField(default=0)
    detail = models.TextField(blank=True, default="")

    def __str__(self) -> str:
        return f"{self.name} - {self.quantity} {self.unit_of_measure}"
