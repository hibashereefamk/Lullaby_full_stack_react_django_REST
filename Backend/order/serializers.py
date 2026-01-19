from .models import Order, OrderItem, Address, Review, Payment
from product.serializers import ProductSerializer, ProductVariantLiteSerializer
from rest_framework import serializers

class OrderItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    variant_details = ProductVariantLiteSerializer(source='variant', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'product', 'product_details', 'variant', 'variant_details', 'quantity', 'price']
        read_only_fields = ['order', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'order_number', 'user', 'total_amount', 'status', 'payment_method', 'payment_status', 'created_at', 'items']
        read_only_fields = ['order_number', 'created_at', 'total_amount', 'status']

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'user', 'street', 'city', 'state', 'postal_code', 'country', 'is_default']
        read_only_fields = ['user']



class PaymentSerializer(serializers.ModelSerializer):
    order_details = OrderSerializer(source='order', read_only=True)

    class Meta:
        model = Payment
        fields = ['id', 'order', 'order_details', 'payment_id', 'amount', 'status', 'created_at']
        read_only_fields = ['created_at']

