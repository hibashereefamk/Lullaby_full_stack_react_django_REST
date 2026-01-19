from django.contrib import admin
from .models import Product, ProductVariant, Promotion, Category, Wishlist, Cart, CartItem

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    min_num = 0

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    # Change 'subtotal' to 'get_subtotal' (the function name below)
    readonly_fields = ['get_subtotal'] 

    # We define the calculation here specifically for the Admin Panel
    def get_subtotal(self, obj):
        # 1. Get the product (handle if you are using 'variant' or 'product' directly)
        if hasattr(obj, 'variant') and obj.variant:
            product = obj.variant.product
        else:
            product = obj.product
            
        # 2. Calculate price
        price = product.discount_price if product.discount_price else product.price
        return price * obj.quantity
    
    # This sets the column header name in the admin table
    get_subtotal.short_description = "Subtotal (Calculated)"

# --- MAIN ADMIN CLASSES ---

class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'section', 'total_stock', 'is_active')
    list_filter = ('category', 'section', 'is_active')
    search_fields = ('name', 'description')
    inlines = [ProductVariantInline]

    def total_stock(self, obj):
        return sum(variant.stock for variant in obj.variants.all())

class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'id', 'created_at')
    inlines = [CartItemInline]

# --- REGISTRATION ---

admin.site.register(Product, ProductAdmin)
admin.site.register(Cart, CartAdmin)
admin.site.register(Category)
admin.site.register(Promotion)
admin.site.register(Wishlist)
admin.site.register(ProductVariant)
admin.site.register(CartItem)