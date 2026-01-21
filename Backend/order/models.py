from django.db import models
from django.conf import settings
import uuid

class Address(models.Model):
    ADDRESS_TYPE_CHOICES = (
        ('home', 'Home'),
        ('work', 'Work'),
        ('other', 'Other'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='addresses')
    full_name = models.CharField(max_length=100, help_text="Receiver's name")
    phone_number = models.CharField(max_length=15)
    street_address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='India')
    is_default = models.BooleanField(default=False)
    address_type = models.CharField(choices=ADDRESS_TYPE_CHOICES,max_length=10, default='home')
    def __str__(self):
        return f"{self.street_address}, {self.city}, {self.country}"
    
    def save(self, *args, **kwargs):
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)
    
class Order(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Placed', 'Placed'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
    ]
    order_number = models.CharField(max_length=20, unique=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    address = models.TextField(help_text="Full address snapshot at time of order")
    status = models.CharField(choices=STATUS_CHOICES, max_length=20, default='Pending')
    payment_method = models.CharField(max_length=50)
    payment_status = models.CharField(max_length=50, default='Pending')

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = str(uuid.uuid4()).split('-')[0].upper()
        super().save(*args, **kwargs)
    def __str__(self):
        return self.order_number
    
class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey('product.Product', on_delete=models.CASCADE)
    variant = models.ForeignKey('product.ProductVariant', on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    size = models.CharField(max_length=50, null=True, blank=True)
    product_name = models.CharField(max_length=255, null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.price and self.product:
            self.price = self.product.discount_price if self.product.discount_price else self.product.price
        if self.product and not self.product_name:
            self.product_name = self.product.name
        if self.variant and not self.size:
            self.size = self.variant.size
        super().save(*args,**kwargs)

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in Order {self.order.order_number}"
class Payment(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    payment_id = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.payment_id} for Order {self.order.order_number}"

class ShippingDetail(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    tracking_number = models.CharField(max_length=50, blank=True, null=True)
    carrier = models.CharField(max_length=50, blank=True, null=True)
    shipped_at = models.DateTimeField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Shipping Detail for Order {self.order.order_number}"   

