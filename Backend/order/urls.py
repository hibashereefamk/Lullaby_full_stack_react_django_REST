from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, OrderItemViewSet, AddressListCreateView, PaymentViewSet


router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'orderitems', OrderItemViewSet, basename='orderitem')
router.register(r'payments', PaymentViewSet, basename='payment')
urlpatterns = [
    path('', include(router.urls)),
    path('addresses/', AddressListCreateView.as_view(), name='address-list-create'),
]