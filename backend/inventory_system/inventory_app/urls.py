from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, PurchaseViewSet, SaleViewSet,
    ExpenseViewSet, ReportViewSet, SettingViewSet,
    UserViewSet, UserRegisterView, overview, report_dates,
    frontend  # 👈 React view
)

router = DefaultRouter()
router.register('products', ProductViewSet)
router.register('purchases', PurchaseViewSet)
router.register('sales', SaleViewSet)
router.register('expenses', ExpenseViewSet)
router.register('reports', ReportViewSet)
router.register('settings', SettingViewSet)
router.register('users', UserViewSet)

urlpatterns = [
    path('register/', UserRegisterView.as_view(), name='register'),
    path('overview/', overview, name='overview'),
    path('api/report_dates/', report_dates, name='report-dates'),
    path('api/', include(router.urls)),  # 👈 All API endpoints
    path('', frontend),  # 👈 React frontend served here
]