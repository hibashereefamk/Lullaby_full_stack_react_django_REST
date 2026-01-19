from rest_framework import serializers
from .models import Product, ProductVariant,Promotion,Category, Wishlist,Cart, CartItem

class CategorySerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True) # Ensures absolute URL

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image']
        read_only_fields = ['slug']

class PromotionSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True) # Forces absolute URL

    class Meta:
        model = Promotion
        fields = ['id', 'title', 'created_at', 'image']
        read_only_fields = ['created_at']


class ProductVariantSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_id = serializers.ReadOnlyField(source='product.id')
    product_image = serializers.ImageField(source='product.image', read_only=True)
    class Meta:
        model = ProductVariant
        fields = ['id', 'product_id', 'product_name', 'product_image', 'size', 'stock']

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
    'id', 'name', 'slug', 'category', 'section','price','image','is_active','discount_price', 'created_at']
        read_only_fields = ['slug', 'created_at']

class ProductVariantLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'size', 'stock']
class ProductDetailSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True)
    variants = ProductVariantLiteSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
    'id', 'name', 'slug', 'category', 'section',
    'price', 'description','image', 'discount_price','variants',
    'is_active', 'created_at']
        read_only_fields = ['slug', 'created_at']

class WhishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True )

    class Meta:
        model = Wishlist
        fields = ['id','user', 'product','product_id','added_at']
        read_only_fields = ['user','added_at']

    def create(self, validated_data):
        user=validated_data['user']
        product=validated_data['product']
        if Wishlist.objects.filter(user=user, product=product).exists():
            raise serializers.ValidationError("This product is already in the wishlist.")

        return Wishlist.objects.create(**validated_data)
    
class CartItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    subtotal = serializers.SerializerMethodField()
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(),source='product', write_only=True)
    size =serializers.ReadOnlyField(source='variant.size',read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'cart', 'product_details', 'quantity', 'product_id','size','added_at', 'subtotal']
        read_only_fields = ['cart', 'added_at', 'subtotal']
    def get_subtotal(self, obj):
        price = obj.product.discount_price if obj.product.discount_price else obj.product.price
        return obj.quantity * price
    
class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_price']
        read_only_fields = ['user']

    def get_total_price(self, obj):
        total = 0
        for item in obj.items.all():
            product = item.variant.product
            price = product.discount_price if product.discount_price else product.price
            total += price * item.quantity
        return total
    