from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, OrderItemViewSet, AddressListCreateView, CreateOrderViwe,AddressDetailView


router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'orderitems', OrderItemViewSet, basename='orderitem')
urlpatterns = [
    path('', include(router.urls)),
    path('addresses/', AddressListCreateView.as_view(), name='address-list-create'),
    path('addresses/<int:pk>/', AddressDetailView.as_view(), name='address-list-create'),
    path('payment/create-order/', CreateOrderViwe.as_view(), name='create-order'),
]