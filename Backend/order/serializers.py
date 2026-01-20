from .models import Order, OrderItem, Address, Payment
from product.serializers import ProductSerializer, ProductVariantLiteSerializer
from rest_framework import serializers
from product.models import Cart,CartItem

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'user', 'street', 'city', 'state', 'postal_code', 'country', 'is_default']
        read_only_fields = ['user']


class OrderItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    variant_details = ProductVariantLiteSerializer(source='variant', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'product', 'product_details', 'variant', 'variant_details', 'quantity', 'price']
        read_only_fields = ['order', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    address_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Order
        fields = ['id', 'order_number', 'user', 'total_amount', 'status', 'payment_method', 'payment_status','address_id', 'created_at', 'items']
        read_only_fields = ['order_number', 'created_at', 'total_amount', 'status', 'user', 'address']

    def create(self, validated_data):
        user =self.context['request'].user
        address_id =validated_data.pop('address_id')
        try:
            address_obj =Address.objects.get(id=address_id,user=user)
        except Address.DoesNotExist:
            raise serializers.ValidationError({'address_id':"Invalid address selected."})
        address_text =f"{address_obj.street},{address_obj.city},{address_obj.state},{address_obj.postal_code},{address_obj.country}"
        try:
            cart = Cart.objects.get(user=user)
            cart_item =cart.items.select_related('product').all()
            if not cart_item.exists():
                raise serializers.ValidationError("Cannot place order. Your cart is empty.")
        except Cart.DoesNotExist:
            raise serializers.ValidationError('Cart not found.')
        
    
        order =Order.objects.create(
        user =user,
        address =address_text,
        payment_method =validated_data('payment_method','COD'),
        total_amount =0

    )
        total_price = 0
        order_items =[]

        for item in cart_item:
            price =item.product.discount_price if item.product.discount_price else item.product.price
            total_price += price * item.quantity

            order_item = OrderItem(
                order =order,
                product =item.product,
                variant =item.variant,
                quantity =item.quantity,
                price =price
            )
            order_items.append(order_item)
            Order.objects.abulk_create(order_items)
            order.total_amount = total_price
            order.save()
            cart.items.all().delete()
            return order


class PaymentSerializer(serializers.ModelSerializer):
    order_details = OrderSerializer(source='order', read_only=True)

    class Meta:
        model = Payment
        fields = ['id', 'order', 'order_details', 'payment_id', 'amount', 'status', 'created_at']
        read_only_fields = ['created_at']

