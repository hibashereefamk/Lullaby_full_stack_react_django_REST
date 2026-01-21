from django.db import models
from django.conf import settings
import uuid
from django.utils.text import slugify

class Promotion(models.Model):
    title = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to='promotions/') 
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=30,unique=True, blank=True) 
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name_plural = "Categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)[:20]
            self.slug = f"{base_slug}-{uuid.uuid4().hex[:4]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    


class Product(models.Model):
    SECTION_CHOICES = (
        ('BOY', 'Boy'),
        ('GIRL', 'Girl'),
        ('BABY', 'Baby'),
    )

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=30, unique=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    section = models.CharField(max_length=10, choices=SECTION_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    image = models.ImageField(upload_to='product_images/')
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    rating = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)[:20]
            self.slug = f"{base_slug}-{uuid.uuid4().hex[:4]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.section})"
    
KID_SIZE_CHOICES = (
    ('0-3M', '0–3 Months'),
    ('3-6M', '3–6 Months'),
    ('6-12M', '6–12 Months'),
    ('1-2Y', '1–2 Years'),
    ('2-3Y', '2–3 Years'),
    ('3-4Y', '3–4 Years'),
    ('4-5Y', '4–5 Years'),
)

class ProductVariant(models.Model):
    product = models.ForeignKey(
        Product,
        related_name='variants',
        on_delete=models.CASCADE
    )
    size = models.CharField(max_length=10, choices=KID_SIZE_CHOICES)
    stock = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.product.name} - {self.size}"


    
class Wishlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlists')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlisted_by')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.email} wishes for {self.product.name}"
    

class Cart(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='carts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Cart of {self.user.email} - {self.id}"
    
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)
    added_at = models.DateTimeField(auto_now_add=True)
    class Meta:
       unique_together = ('cart', 'product','variant')


    def __str__(self):
            return f"{self.quantity} of {self.product.name} in cart {self.cart.id}"
