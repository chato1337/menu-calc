from django.contrib import admin

from .models import Day, Order, OrderProduct, Product, ProductQuantity, Recipe


admin.site.register(Product)
admin.site.register(ProductQuantity)
admin.site.register(Recipe)
admin.site.register(Day)
admin.site.register(Order)
admin.site.register(OrderProduct)
