from django.contrib import admin
from .models import User, Product, Purchase, Sale, Expense, Report, Setting

admin.site.register(User)
admin.site.register(Product)
admin.site.register(Purchase)
admin.site.register(Sale)
admin.site.register(Expense)
admin.site.register(Report)
admin.site.register(Setting)
