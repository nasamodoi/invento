from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from inventory_app.views import frontend

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('inventory_app.urls')),  # ✅ API routes only
    path('', frontend),  # ✅ React frontend fallback
]


# from django.contrib import admin
# from django.urls import path, include, re_path
# from django.views.generic import TemplateView
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
#     path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
#     path('api/', include('inventory_app.urls')),

#     # ✅ Catch-all for React Router
#     re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
# ]