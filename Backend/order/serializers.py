from .models import Order, OrderItem, Address, Payment
from product.serializers import ProductSerializer, ProductVariantLiteSerializer
from rest_framework import serializers
from product.models import Cart


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


from rest_framework import serializers
from .models import Address

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'full_name', 'phone_number', 'street_address', 'city', 'state', 'postal_code', 'country', 'address_type', 'is_default']

class OrderItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    variant_details = ProductVariantLiteSerializer(source='variant', read_only=True)
    
    class Meta:
        model = OrderItem
        # 1. Added 'size' and 'product_name' to fields
        fields = [
            'id', 'order', 'product', 'product_details', 
            'variant', 'variant_details', 'quantity', 'price',
            'size', 'product_name' 
        ]
        # 2. Added them to read_only_fields (backend generates them)
        read_only_fields = ['order', 'price', 'size', 'product_name']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    address_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Order
        fields = ['id', 'order_number', 'user', 'total_amount', 'status', 'payment_method', 'payment_status', 'address_id', 'created_at', 'items']
        read_only_fields = ['order_number', 'created_at', 'total_amount', 'status', 'user', 'address']

    def create(self, validated_data):
        user = self.context['request'].user
        address_id = validated_data.pop('address_id')

        # 1. Validate Address
        try:
            address_obj = Address.objects.get(id=address_id, user=user)
        except Address.DoesNotExist:
            raise serializers.ValidationError({'address_id': "Invalid address selected."})
        
        address_text = f"{address_obj.street}, {address_obj.city}, {address_obj.state}, {address_obj.postal_code}, {address_obj.country}"
        
        # 2. Validate Cart
        try:
            cart = Cart.objects.get(user=user)
            cart_items = cart.items.select_related('product', 'variant').all()
            if not cart_items.exists():
                raise serializers.ValidationError("Cannot place order. Your cart is empty.")
        except Cart.DoesNotExist:
            raise serializers.ValidationError('Cart not found.')
        
        # 3. Create Order
        # Use .get() for dictionary access
        order = Order.objects.create(
            user=user,
            address=address_text,
            payment_method=validated_data.get('payment_method', 'COD'), 
            total_amount=0
        )

        total_price = 0
        order_items = []

        # 4. Loop through Cart Items
        for item in cart_items:
            price = item.product.discount_price if item.product.discount_price else item.product.price
            total_price += price * item.quantity
            
            # Helper logic to get size safely
            item_size = item.variant.size if item.variant else getattr(item, 'size', None)
            item_name = item.product.name

            order_item = OrderItem(
                order=order,
                product=item.product,
                variant=item.variant,
                quantity=item.quantity,
                price=price,
                size=item_size,          # Explicitly pass size
                product_name=item_name   # Explicitly pass name
            )
            order_items.append(order_item)
        
        # 5. Bulk Create OUTSIDE the loop
        # Use OrderItem.objects.bulk_create (Correct Manager, Correct Method)
        OrderItem.objects.bulk_create(order_items)

        # 6. Finalize Order
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

