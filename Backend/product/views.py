from rest_framework import viewsets, permissions,filters
from .models import Product, Promotion, Category, Wishlist, Cart, CartItem,ProductVariant
from .permission import  IsVendorOrAdminOrReadOnly
from .serializers import ProductSerializer, PromotionSerializer,CategorySerializer, WhishlistSerializer, CartItemSerializer,CartSerializer,ProductDetailSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework import status

class PromotionViewSet(viewsets.ModelViewSet):
    queryset = Promotion.objects.filter(is_active=True) # Only show active slides
    serializer_class = PromotionSerializer
    permission_classes = [IsVendorOrAdminOrReadOnly]

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes =[IsVendorOrAdminOrReadOnly]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes =[IsVendorOrAdminOrReadOnly]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = ['category', 'section'] # Exact match fields
    search_fields = ['name', 'description']    # Fields to search in
    ordering_fields = ['price', 'created_at']
class ProductDetailViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductDetailSerializer
    permission_classes =[IsVendorOrAdminOrReadOnly]
    
class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WhishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes =[permissions.IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes =[permissions.IsAuthenticated]

   

    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user).order_by("id")
    def create(self, request, *args, **kwargs):
        user =request.user
        cart, _ = Cart.objects.get_or_create(user=user)
        product_id =request.data.get('product_id')

        cart_item =CartItem.objects.filter(cart=cart,product_id=product_id).first() 
        if cart_item:
            cart_item.quantity += 1
            cart_item.save()
            return Response({"message":"Quantity updated"},status=status.HTTP_200_OK)
        else:
            serializer =self.get_serializer(data =request.data)
            serializer.is_valid(raise_exception =True)
            serializer.save(cart=cart)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

       
        
