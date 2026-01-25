from rest_framework import serializers
from .models import Product, ProductVariant,Promotion,Category, Wishlist,Cart, CartItem
import json


class CategorySerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True) 

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image','discount_percentage']
        read_only_fields = ['slug']

class PromotionSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True) # Forces absolute URL

    class Meta:
        model = Promotion
        fields = ['id', 'title', 'created_at', 'image']
        read_only_fields = ['created_at']


# class ProductVariantSerializer(serializers.ModelSerializer):
#     product_name = serializers.ReadOnlyField(source='product.name')
#     product_id = serializers.ReadOnlyField(source='product.id')
#     product_image = serializers.ImageField(source='product.image', read_only=True)
#     class Meta:
#         model = ProductVariant
#         fields = ['id', 'product_id', 'product_name', 'product_image', 'size', 'stock']
        

class ProductSerializer(serializers.ModelSerializer):
    sizes = serializers.SerializerMethodField()
    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'category','sizes', 'section','price','image','rating','is_active','discount_price', 'created_at']
        read_only_fields = ['slug', 'created_at']

    def get_sizes(self,obj):
        variants = ProductVariant.objects.filter(product=obj)
        return list(set(variant.size for variant in variants))


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
    'price', 'description','image', 'discount_price','variants','rating',
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
    size = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'cart','size','product_details', 'quantity', 'product_id','added_at', 'subtotal']
        read_only_fields = ['cart', 'added_at', 'subtotal']
    def get_subtotal(self, obj):
        price = obj.product.discount_price if obj.product.discount_price else obj.product.price
        return obj.quantity * price
    def get_size(self, obj):
        if obj.variant:
            return obj.variant.size
        return None
    
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
    


class ProductsAdminSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category.name', read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category')
    
    variants = ProductVariantLiteSerializer(many=True)
    total_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'created_at', 'is_active', 'price', 'discount_price', 
                  'total_stock', 'variants', 'category', 'image', 'name', 
                  'description', 'category_id', 'section']

    # 1. Parsing Logic (Keeps your data clean)
    def to_internal_value(self, data):
        if hasattr(data, 'dict'):
            data = data.dict()
        elif hasattr(data, 'copy'):
            data = data.copy()

        if 'variants' in data and isinstance(data['variants'], str):
            try:
                data['variants'] = json.loads(data['variants'])
            except ValueError:
                pass 
        return super().to_internal_value(data)

    # 2. CREATE METHOD (This fixes your current error!)
    def create(self, validated_data):
        # Remove variants from the main product data
        variants_data = validated_data.pop('variants', [])
        
        # Create the Product first
        product = Product.objects.create(**validated_data)
        
        # Loop through and create each variant linked to this product
        for variant_item in variants_data:
            ProductVariant.objects.create(product=product, **variant_item)
            
        return product

    # 3. UPDATE METHOD (You already had this)
    def update(self, instance, validated_data):
        variants_data = validated_data.pop('variants', None)
        
        # Update standard fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update variants if provided
        if variants_data is not None:
            instance.variants.all().delete() # Optional: Clear old variants
            for variant_item in variants_data:
                ProductVariant.objects.create(product=instance, **variant_item)

        return instance

    def get_total_stock(self, obj):
        variants = obj.variants.all() if hasattr(obj,'variants') else obj.productvariant_set.all()
        return sum(variant.stock for variant in variants)