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
    buying_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    category = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    @property
    def total_value(self):
        return self.buying_price * self.quantity

    @property
    def is_low_stock(self):
        return self.quantity <= 2

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

        if self.product.buying_price != self.price_per_unit:
            self.product.buying_price = self.price_per_unit

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
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True)
    sold_at = models.DateTimeField(auto_now_add=True)
    sold_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def save(self, *args, **kwargs):
        self.amount = self.price_per_unit * self.quantity

        if self.product.quantity < self.quantity:
            raise ValidationError("Insufficient stock for sale.")

        self.product.quantity -= self.quantity
        self.product.save()

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
# Report
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

    def calculate_total_sales(self):
        sales = Sale.objects.all()
        self.total_sales = sum(s.amount for s in sales)
        self.save()

    def calculate_total_purchases(self):
        purchases = Purchase.objects.all()
        self.total_purchases = sum(p.amount for p in purchases)
        self.save()

    def calculate_total_expenses(self):
        expenses = Expense.objects.all()
        self.total_expenses = sum(e.amount for e in expenses)
        self.save()

    def calculate_total_product_price(self):
        self.total_product_price = sum(p.total_value for p in Product.objects.all())
        self.save()

    def calculate_cogs(self):
        sales = Sale.objects.select_related('product').all()
        return sum(s.quantity * s.product.buying_price for s in sales)

    def generate_all_metrics(self):
        self.calculate_total_sales()
        self.calculate_total_purchases()
        self.calculate_total_expenses()
        self.calculate_total_product_price()

        cogs = self.calculate_cogs()
        self.net_profit = self.total_sales - cogs - self.total_expenses
        self.save()

# ---------------------
# Setting
# ---------------------
class Setting(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.key