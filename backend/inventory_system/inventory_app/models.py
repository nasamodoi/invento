from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

# ---------------------
# Custom User Model
# ---------------------
class User(AbstractUser):
    is_admin = models.BooleanField(default=False)
    is_staff_user = models.BooleanField(default=True)  # default user type

    def __str__(self):
        return self.username

# ---------------------
# Product
# ---------------------
class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    quantity = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# ---------------------
# Purchase
# ---------------------
class Purchase(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    purchased_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    purchased_at = models.DateTimeField(auto_now_add=True)

    # ✅ New field to store total amount
    amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, default=0)

    def save(self, *args, **kwargs):
        # Auto-calculate amount before saving
        self.amount = self.price_per_unit * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Purchase - {self.product.name} ({self.quantity})"

# ---------------------
# Sale
# ---------------------
class Sale(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True)
    sold_at = models.DateTimeField(auto_now_add=True)
    sold_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def save(self, *args, **kwargs):
        self.amount = self.price_per_unit * self.quantity
        super().save(*args, **kwargs)


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

    def __str__(self):
        return f"Report {self.id} - {self.generated_at.strftime('%Y-%m-%d')}"

# ---------------------
# Setting
# ---------------------
class Setting(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.key}"
