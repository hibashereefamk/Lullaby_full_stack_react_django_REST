from rest_framework import viewsets, permissions,filters
from .models import Product, Promotion, Category, Wishlist, Cart, CartItem,ProductVariant
from .permission import  IsVendorOrAdminOrReadOnly
from .serializers import ProductSerializer, PromotionSerializer,CategorySerializer, WhishlistSerializer, CartItemSerializer,CartSerializer,ProductDetailSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

class PromotionViewSet(viewsets.ModelViewSet):
    queryset = Promotion.objects.filter(is_active=True) 
    serializer_class = PromotionSerializer
    permission_classes = [IsVendorOrAdminOrReadOnly]
    pagination_class = None

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes =[IsVendorOrAdminOrReadOnly]
    pagination_class = None

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes =[IsVendorOrAdminOrReadOnly]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = ['category', 'section']
    search_fields = ['name', 'description']    
    ordering_fields = ['price', 'created_at']
    
class ProductDetailViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductDetailSerializer
    permission_classes =[IsVendorOrAdminOrReadOnly]
    pagination_class = None
    
class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WhishlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes =[permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user).order_by('-added_at')

    def create(self, request, *args, **kwargs):
        user = request.user
        cart, _ = Cart.objects.get_or_create(user=user)
        product_id = request.data.get('product_id')
        size = request.data.get('size') 
        try:
            quantity = int(request.data.get('quantity', 1))
        except (ValueError, TypeError):
            quantity = 1

        if not product_id:
            return Response({'error': "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        product = get_object_or_404(Product, id=product_id)
        variant = None
        if size:
            try:
                variant = ProductVariant.objects.get(product=product, size=size)
            except ProductVariant.DoesNotExist:
                return Response({'error': f"Size '{size}' not available for this product"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if this exact item (Product + Variant) already exists in the cart
        cart_item = CartItem.objects.filter(cart=cart, product=product, variant=variant).first()

        if cart_item:
            # Update quantity if it exists
            cart_item.quantity += quantity
            cart_item.save()
            return Response({"message": "Quantity updated"}, status=status.HTTP_200_OK)
        else:
            # Create new item if it doesn't exist
            new_item = CartItem.objects.create(
                cart=cart, 
                product=product, 
                variant=variant, 
                quantity=quantity
            )
            serializer = self.get_serializer(new_item)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        cart_item = self.get_object()
        
        # 1. Check if the request contains 'size' update
        if 'size' in request.data:
            size_name = request.data['size']
            product = cart_item.product
            
            # 2. Find the variant for this new size
            try:
                variant = ProductVariant.objects.get(product=product, size=size_name)
                
                # 3. Check if an item with this new size ALREADY exists in the cart
                # (We exclude the current item 'cart_item.pk' to avoid comparing it to itself)
                existing_item = CartItem.objects.filter(
                    cart=cart_item.cart, 
                    product=product, 
                    variant=variant
                ).exclude(pk=cart_item.pk).first()

                if existing_item:
                    # MERGE: Add current quantity to the existing item's quantity
                    existing_item.quantity += cart_item.quantity
                    existing_item.save()
                    
                    # Delete the current item since it's now merged
                    cart_item.delete()
                    
                    # Return the updated existing item
                    serializer = self.get_serializer(existing_item)
                    return Response(serializer.data)
                
                else:
                    # UPDATE: No duplicate found, just switch the variant
                    cart_item.variant = variant
                    cart_item.save()

            except ProductVariant.DoesNotExist:
                return Response({'error': 'Size not found'}, status=status.HTTP_400_BAD_REQUEST)

        # 4. Handle standard updates (like changing quantity buttons in cart)
        return super().partial_update(request, *args, **kwargs)