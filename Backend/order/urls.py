from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, OrderItemViewSet, AddressViewSet, PaymentViewSet


router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'orderitems', OrderItemViewSet, basename='orderitem')
router.register(r'addresses', AddressViewSet, basename='address')
router.register(r'payments', PaymentViewSet, basename='payment')
urlpatterns = [
    path('', include(router.urls)),
]