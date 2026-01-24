from .models import Order, OrderItem, Address, Payment
from product.serializers import ProductSerializer, ProductVariantLiteSerializer

from rest_framework import serializers
from product.models import Cart,ProductVariant

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'full_name', 'phone_number', 'street_address', 'city', 'state', 'postal_code', 'country', 'address_type', 'is_default']

    def validate_phone_number(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("Phone number must contain only digits.")
        if len(value) != 10 :
            raise serializers.ValidationError("Phone number is not valid")
        return value
        
    def validate_postal_code(self,value):
        if not value.isdigit():
            raise serializers.ValidationError("Postal code must contain only digits.")
        if len(value) != 6 :
            raise serializers.ValidationError("Postal code must contain 6 digits")
        return value
    
class OrderItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    variant_details = ProductVariantLiteSerializer(source='variant', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'order', 'product', 'product_details', 
            'variant', 'variant_details', 'quantity', 'price',
            'size', 'product_name' 
        ]
        read_only_fields = ['order', 'price', 'size', 'product_name']
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    address_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Order
        fields = ['id', 'order_number', 'user', 'total_amount', 'status', 'payment_method', 'payment_status', 'address_id', 'address', 'created_at', 'items']
        read_only_fields = ['order_number', 'created_at', 'total_amount', 'status', 'user', 'address']

    def create(self, validated_data):
        user = self.context['request'].user
        address_id = validated_data.pop('address_id')
        try:
            address_obj = Address.objects.get(id=address_id, user=user)
        except Address.DoesNotExist:
            raise serializers.ValidationError({'address_id': "Invalid address selected."})
        
        address_text = f"{address_obj.street_address}, {address_obj.city}, {address_obj.state}, {address_obj.postal_code}, {address_obj.country}"
        
        try:
            cart = Cart.objects.get(user=user)
            cart_items = cart.items.select_related('product', 'variant').all()
            if not cart_items.exists():
                raise serializers.ValidationError("Cannot place order. Your cart is empty.")
        except Cart.DoesNotExist:
            raise serializers.ValidationError('Cart not found.')
        
        order = Order.objects.create(
            user=user,
            address=address_text,
            payment_method=validated_data.get('payment_method', 'COD'), 
            total_amount=0
        )

        total_price = 0
        order_items = []

        for item in cart_items:
            variant =item.variant

            if variant:
                locked_variant = ProductVariant.objects.select_for_update().get(id = variant.id)
                if locked_variant.stock < item.quantity:
                    raise serializers.ValidationError(
                        f"Out of stock. Only {locked_variant.stock} left for {item.product.name} ({locked_variant.size})"
                    )
                locked_variant.stock -=item.quantity
                locked_variant.save()

            price = item.product.discount_price if item.product.discount_price else item.product.price
            total_price += price * item.quantity
            item_size = item.variant.size if item.variant else getattr(item, 'size', None)
            item_name = item.product.name

            order_item = OrderItem(
                order=order,
                product=item.product,
                variant=item.variant,
                quantity=item.quantity,
                price=price,
                size=item_size,
                product_name=item_name
            )
            order_items.append(order_item)
        OrderItem.objects.bulk_create(order_items)
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


 
class OrderAdminSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(read_only=True, many=True)
    order_date = serializers.DateTimeField(source='created_at', format="%Y-%m-%d", read_only=True)
    user = serializers.CharField(source='user.name', read_only=True)
    

    class Meta:
        model = Order
        fields = [
            'id', 
            'order_number', 
            'status', 
            'user',           
            'items',          
            'total_amount', 
            'payment_method', 
            'payment_status', 
            'address',        
            'order_date'
        ]