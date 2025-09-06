from rest_framework import serializers
from .models import User, Product, Purchase, Sale, Expense, Report, Setting
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model

# ---------------------
# User Serializer
# ---------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'email', 'is_admin', 'is_staff_user', 'is_active']

# ---------------------
# User Register Serializer (Admin Only)
# ---------------------
class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    is_active = serializers.BooleanField(default=True)

    class Meta:
        model = get_user_model()
        fields = ['username', 'email', 'password', 'password2', 'is_admin', 'is_staff_user', 'is_active']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        return get_user_model().objects.create_user(**validated_data)

# ---------------------
# Product Serializer (with low stock warning)
# ---------------------
class ProductSerializer(serializers.ModelSerializer):
    low_stock = serializers.SerializerMethodField()
    total_value = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_low_stock(self, obj):
        return obj.quantity <= 5

    def get_total_value(self, obj):
        return obj.buying_price * obj.quantity

# ---------------------
# Purchase Serializer (block if stock is sufficient)
# ---------------------
class PurchaseSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    purchased_by_username = serializers.CharField(source='purchased_by.username', read_only=True)

    class Meta:
        model = Purchase
        fields = '__all__'

    def validate(self, data):
        product = data['product']
        if product.quantity > 1:
            raise serializers.ValidationError({
                'product': f"Cannot purchase: '{product.name}' has sufficient stock ({product.quantity})"
            })
        return data

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value

    def create(self, validated_data):
        product = validated_data['product']
        quantity = validated_data['quantity']

        product.quantity += quantity
        product.buying_price = validated_data['price_per_unit']
        product.save()

        return super().create(validated_data)

# ---------------------
# Sale Serializer (with selling price reference)
# ---------------------
class SaleSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    sold_by_username = serializers.CharField(source='sold_by.username', read_only=True)
    amount = serializers.SerializerMethodField()
    selling_price = serializers.DecimalField(
        source='product.selling_price',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = Sale
        fields = [
            'id', 'product', 'product_name', 'selling_price',
            'quantity', 'price_per_unit', 'amount',
            'sold_by', 'sold_by_username', 'sold_at'
        ]

    def get_amount(self, obj):
        return obj.price_per_unit * obj.quantity

    def validate(self, data):
        product = data['product']
        quantity_requested = data['quantity']

        if product.quantity < quantity_requested:
            raise serializers.ValidationError({
                'quantity': f"Insufficient stock. Only {product.quantity} items available."
            })

        return data

    def create(self, validated_data):
        product = validated_data['product']
        quantity = validated_data['quantity']

        product.quantity -= quantity
        product.save()

        return super().create(validated_data)

# ---------------------
# Expense Serializer
# ---------------------
class ExpenseSerializer(serializers.ModelSerializer):
    spent_by_username = serializers.CharField(source='spent_by.username', read_only=True)

    class Meta:
        model = Expense
        fields = '__all__'

# ---------------------
# Report Serializer (overview-ready)
# ---------------------
class ReportSerializer(serializers.ModelSerializer):
    generated_by_username = serializers.CharField(source='generated_by.username', read_only=True)

    class Meta:
        model = Report
        fields = [
            'id', 'generated_by', 'generated_by_username', 'generated_at',
            'notes', 'total_sales', 'total_purchases',
            'total_expenses', 'net_profit', 'total_product_price'
        ]

# ---------------------
# Setting Serializer
# ---------------------
class SettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setting
        fields = '__all__'