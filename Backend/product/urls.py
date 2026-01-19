from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductDetailViewSet, ProductViewSet, PromotionViewSet, CategoryViewSet, WishlistViewSet, CartViewSet, CartItemViewSet

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
]