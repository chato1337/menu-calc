from django.conf import settings
from rest_framework.pagination import LimitOffsetPagination


class DefaultLimitOffsetPagination(LimitOffsetPagination):
    default_limit = settings.REST_FRAMEWORK.get("PAGE_SIZE", 20)
    max_limit = settings.REST_FRAMEWORK.get("MAX_LIMIT", 100)
