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
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user).order_by('-added_at')

    # 👇 PASTE THIS METHOD INSIDE THE CLASS 👇
    def partial_update(self, request, *args, **kwargs):
        cart_item = self.get_object()
        
        # 1. Check if the request contains 'size'
        if 'size' in request.data:
            size_name = request.data['size']
            product = cart_item.product
            
            # 2. Find the variant for this size
            try:
                variant = ProductVariant.objects.get(product=product, size=size_name)
                
                # 3. Check if this causes a duplicate in the cart
                # (e.g., merging "No Size" item into an existing "Size M" item)
                existing_item = CartItem.objects.filter(
                    cart=cart_item.cart, 
                    product=product, 
                    variant=variant
                ).exclude(pk=cart_item.pk).first()

                if existing_item:
                    # Merge quantity and delete current item
                    existing_item.quantity += cart_item.quantity
                    existing_item.save()
                    cart_item.delete()
                    # Return the updated existing item
                    serializer = self.get_serializer(existing_item)
                    return Response(serializer.data)
                
                else:
                    # Update the current item's variant
                    cart_item.variant = variant
                    cart_item.save()

            except ProductVariant.DoesNotExist:
                return Response({'error': 'Size not found'}, status=status.HTTP_400_BAD_REQUEST)

        # 4. Handle other updates (like quantity) normally
        return super().partial_update(request, *args, **kwargs)