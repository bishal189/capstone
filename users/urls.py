from django.urls import path
from .views import login_view, register, forgot_pass, reset_pass, admin_dashboard, superadmin_dashboard

urlpatterns = [
    path('login/', login_view, name='login'),
    path('register/', register, name='register'),
    path('forgot-password/', forgot_pass, name='forgot_pass'),
    path('reset-password/', reset_pass, name='reset_pass'),
    path('admin-dashboard/', admin_dashboard, name='admin_dashboard'),
    path('superadmin-dashboard/', superadmin_dashboard, name='superadmin_dashboard'),
]
