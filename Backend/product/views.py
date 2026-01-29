from rest_framework import viewsets, permissions,filters
from .models import Product, Promotion, Category, Wishlist, Cart, CartItem,ProductVariant
from .permission import IsActiveUser
from .serializers import (ProductSerializer, PromotionSerializer,CategorySerializer, WhishlistSerializer,
                          CartItemSerializer,CartSerializer,ProductDetailSerializer,ProductsAdminSerializer)
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
import json
from Users.models import CustomUser
class PromotionViewSet(viewsets.ModelViewSet):
    queryset = Promotion.objects.filter(is_active=True) 
    serializer_class = PromotionSerializer
    pagination_class = None

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    pagination_class = None

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = ProductSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = ['category', 'section']
    search_fields = ['name', 'description']    
    ordering_fields = ['price', 'created_at']
    
class ProductDetailViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductDetailSerializer
    pagination_class = None
    
class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WhishlistSerializer
    permission_classes = [IsActiveUser]
    pagination_class = None

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes =[IsActiveUser]
    pagination_class = None

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [IsActiveUser]
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

        cart_item = CartItem.objects.filter(cart=cart, product=product, variant=variant).first()

        if cart_item:

            cart_item.quantity += quantity
            cart_item.save()
            return Response({"message": "Quantity updated"}, status=status.HTTP_200_OK)
        else:
    
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
        
     
        if 'size' in request.data:
            size_name = request.data['size']
            product = cart_item.product
            
  
            try:
                variant = ProductVariant.objects.get(product=product, size=size_name)
                
                existing_item = CartItem.objects.filter(
                    cart=cart_item.cart, 
                    product=product, 
                    variant=variant
                ).exclude(pk=cart_item.pk).first()

                if existing_item:
                    existing_item.quantity += cart_item.quantity
                    existing_item.save()
                    cart_item.delete()
                    
                    serializer = self.get_serializer(existing_item)
                    return Response(serializer.data)
                
                else:
                    cart_item.variant = variant
                    cart_item.save()

            except ProductVariant.DoesNotExist:
                return Response({'error': 'Size not found'}, status=status.HTTP_400_BAD_REQUEST)

        return super().partial_update(request, *args, **kwargs)
    
class Countwhilistandcartview(APIView):
    
    def get(self,request):
        user=request.user
        
        wishlist_count=Wishlist.objects.filter(user=user).count()
        cartitem_count=CartItem.objects.filter(cart__user=user).count()
        return Response ({
            "wishlist_count" :wishlist_count,
            "cartitem_count" :cartitem_count
        })
    

class ProductAdminListAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        queryset = Product.objects.all().order_by('-created_at')
        category_id = request.query_params.get('category')
        in_stock = request.query_params.get('in_stock')

        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        if in_stock:
            is_in_stock = in_stock.lower() == 'true'
            if is_in_stock:
                queryset = queryset.filter(stock__gt=0)
            else:
                queryset = queryset.filter(stock=0)

        search_query = request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) | 
                Q(description__icontains=search_query) |
                Q(sku__icontains=search_query)
            )

        ordering = request.query_params.get('ordering')
        if ordering:
        
            valid_fields = ['price', 'stock', 'created_at', 'name']
            check_field = ordering.lstrip('-')
            if check_field in valid_fields:
                queryset = queryset.order_by(ordering)


        paginator = PageNumberPagination()
        paginator.page_size = 10 
        result_page = paginator.paginate_queryset(queryset, request)
        
        serializer = ProductsAdminSerializer(result_page, many=True)
        
        return paginator.get_paginated_response(serializer.data)

    def post(self,request):
        data = request.data.copy()
        if 'variants' in data and isinstance(data['variants'], str):
            try:
                data['variants'] = json.loads(data['variants'])
            except ValueError:
                return Response({"error": "Invalid variants JSON"}, status=status.HTTP_400_BAD_REQUEST)
        serializer =ProductsAdminSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class ProductAdminDetailAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get_object(self, pk):
        return get_object_or_404(Product, pk=pk)

    def get(self, request, pk):
        product = self.get_object(pk)
        serializer = ProductsAdminSerializer(product)
        return Response(serializer.data)
    def patch(self, request, pk):
        product = self.get_object(pk)
        serializer = ProductsAdminSerializer(product, data=request.data,partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk):
        product = self.get_object(pk)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)