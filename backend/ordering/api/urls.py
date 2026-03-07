from rest_framework.routers import DefaultRouter

from .views import (
    AgeGroupViewSet,
    DayViewSet,
    OrderViewSet,
    ProductQuantityViewSet,
    ProductViewSet,
    RecipeViewSet,
    TemplateViewSet,
)


router = DefaultRouter()
router.register("products", ProductViewSet, basename="product")
router.register("age-groups", AgeGroupViewSet, basename="age-group")
router.register("product-quantities", ProductQuantityViewSet, basename="product-quantity")
router.register("recipes", RecipeViewSet, basename="recipe")
router.register("days", DayViewSet, basename="day")
router.register("orders", OrderViewSet, basename="order")
router.register("templates", TemplateViewSet, basename="template")

urlpatterns = router.urls
