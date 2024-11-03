# views.py/users
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.forms import inlineformset_factory

#Create your views here
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib.auth.hashers import make_password
from django.contrib import messages
from django.utils import timezone
from .models import CustomUser
from users.models import CustomUser
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import logging

logger = logging.getLogger(__name__)    

# views.py/users
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import make_password
from django.contrib import messages
from django.utils import timezone
from .models import CustomUser
import logging

logger = logging.getLogger(__name__)

# Login View
def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
      
        
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            
            if user.account_type == 'superadmin':
                return redirect('superadmin_dashboard')
            elif user.account_type == 'admin':
                return redirect('admin_dashboard')
            else:
                messages.error(request, 'You do not have access.')
                return redirect('login')
        else:
            messages.error(request, 'Invalid credentials')
            return redirect('login')

    return render(request, 'users/login.html')

# Register View
@csrf_exempt
def register(request):
    if request.method == 'POST':
   
        email = request.POST.get('email')
        username = request.POST.get('username')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confrim_password')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        gender = request.POST.get('gender')
        contact_number = request.POST.get('contact_number')
        
        print(' i am register view ',request.POST)

        if password != confirm_password:
            print('i am bad ')
            messages.error(request, "Passwords do not match.")
            return render(request, 'users/register.html')

        if not all([email, username, password, first_name, last_name, gender, contact_number]):
            print(' i am bad')
            messages.success(request, "Please fill in all required fields.")
            return render(request, 'users/register.html')

        try:
            print('i am in good')
            user = CustomUser()
            user.email=email
            user.username=username
            user.first_name=first_name
            user.last_name=last_name
            user.gender=gender
            user.contact_number=contact_number
            user.password=make_password(password) 
            user.save()
            messages.success(request, "Registration successful! Please log in below.")
            return redirect('login')

        except Exception as e:
            print(' sorry i am mistake run')
            messages.error(request, f"An error occurred: {str(e)}")
            return render(request, 'users/register.html')

    return render(request, 'users/register.html')

# Forgot Password View
def forgot_pass(request):
    return render(request, 'users/forgot-pass.html')

# Reset Password View
def reset_pass(request):
    return render(request, 'users/reset-pass.html')

# Admin Dashboard View
@login_required
def admin_dashboard(request):
    return render(request, 'admin_panel/index.html')

# Superadmin Dashboard View
@login_required
def superadmin_dashboard(request):
    return render(request, 'superadmin/sa_index.html')
