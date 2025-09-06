from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError

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
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # ✅ new field
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
        # ✅ Block purchase if product stock is sufficient
        if self.product.quantity > 1:
            raise ValidationError("Cannot purchase: product stock is sufficient")

        self.amount = self.price_per_unit * self.quantity

        # ✅ Update buying price if changed
        if self.product.buying_price != self.price_per_unit:
            self.product.buying_price = self.price_per_unit

        # ✅ Increase product quantity
        self.product.quantity += self.quantity
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
    total_product_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"Report {self.id} - {self.generated_at.strftime('%Y-%m-%d')}"

    def calculate_total_sales_and_profit(self):
        from .models import Sale, Product
        sales = Sale.objects.all()
        total_sales = sum([s.amount for s in sales])
        total_cost = sum([
            s.quantity * Product.objects.get(id=s.product.id).buying_price
            for s in sales
        ])
        profit = total_sales - total_cost
        self.total_sales = total_sales
        self.net_profit = profit
        self.save()

    def calculate_total_purchases(self):
        from .models import Purchase
        purchases = Purchase.objects.all()
        total = sum([p.amount for p in purchases])
        self.total_purchases = total
        self.save()

    def calculate_total_expenses(self):
        from .models import Expense
        expenses = Expense.objects.all()
        total = sum([e.amount for e in expenses])
        self.total_expenses = total
        self.save()

    def calculate_total_product_price(self):
        from .models import Product
        total = sum([p.total_value for p in Product.objects.all()])
        self.total_product_price = total
        self.save()

    def generate_all_metrics(self):
        self.calculate_total_sales_and_profit()
        self.calculate_total_purchases()
        self.calculate_total_expenses()
        self.calculate_total_product_price()

        # Setting
# ---------------------
class Setting(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.key}"