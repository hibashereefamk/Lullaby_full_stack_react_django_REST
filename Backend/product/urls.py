from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (ProductDetailViewSet, ProductViewSet, PromotionViewSet,
                     CategoryViewSet, WishlistViewSet, CartViewSet, CartItemViewSet,
                     ProductAdminDetailAPIView,ProductAdminListAPIView)

router = DefaultRouter()
router.register(r'products', ProductViewSet ,basename='product')
router.register(r'productdetails', ProductDetailViewSet ,basename='productdetail')
router.register(r'promotions', PromotionViewSet, basename='promotion')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'wishlist', WishlistViewSet, basename='wishlist')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'cartitems', CartItemViewSet, basename='cartitem')
urlpatterns = [
    path('api/', include(router.urls)),
    path('api/admin/products/',ProductAdminListAPIView.as_view(),name='prduct_list_admin'),
    path('api/admin/products/<int:pk>/',ProductAdminDetailAPIView.as_view(),name='pduct-detail-admin')
]