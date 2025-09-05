from django.db import models
from django.contrib.auth.models import AbstractUser

# ---------------------
# Custom User Model
# ---------------------
class User(AbstractUser):
    is_admin = models.BooleanField(default=False)
    is_staff_user = models.BooleanField(default=True)

    def __str__(self):
        return self.username

# ---------------------
# Product
# ---------------------
class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    quantity = models.IntegerField(default=0)
    buying_price = models.DecimalField(max_digits=10, decimal_places=2)  # ✅ actual cost
    category = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    @property
    def total_value(self):
        return self.buying_price * self.quantity  # ✅ used in report

# ---------------------
# Purchase
# ---------------------
class Purchase(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    purchased_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    purchased_at = models.DateTimeField(auto_now_add=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, default=0)

    def save(self, *args, **kwargs):
        self.amount = self.price_per_unit * self.quantity
        # ✅ Update product buying price if changed
        if self.product.buying_price != self.price_per_unit:
            self.product.buying_price = self.price_per_unit
            self.product.save()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Purchase - {self.product.name} ({self.quantity})"

# ---------------------
# Sale
# ---------------------
class Sale(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)  # ✅ selling price
    amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True)
    sold_at = models.DateTimeField(auto_now_add=True)
    sold_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def save(self, *args, **kwargs):
        self.amount = self.price_per_unit * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Sale - {self.product.name} ({self.quantity})"

# ---------------------
# Expense
# ---------------------
class Expense(models.Model):
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    spent_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    spent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.description

# ---------------------
# Report (auto-generated)
# ---------------------
class Report(models.Model):
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    generated_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    total_sales = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_purchases = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_expenses = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_profit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_product_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)  # ✅ new field

    def __str__(self):
        return f"Report {self.id} - {self.generated_at.strftime('%Y-%m-%d')}"

    def calculate_total_product_price(self):
        from .models import Product
        total = sum([p.total_value for p in Product.objects.all()])
        self.total_product_price = total
        self.save()

        # Setting
# ---------------------
class Setting(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.key}"