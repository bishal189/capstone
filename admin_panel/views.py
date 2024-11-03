# admin_panel/views.py
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from django.shortcuts import render, redirect
from django.contrib import messages
from django.conf import settings
from users.models import CustomUser
from .models import ChildRecord,MaternalRecord
from django.core.files.storage import FileSystemStorage
from datetime import datetime

@login_required
def admin_dashboard(request):
    return render(request, 'admin_panel/index.html')

@login_required
def admin_events(request):
    return render(request, 'admin_panel/events.html')

@login_required
def admin_profile(request):
    user = request.user

    if request.method == 'POST':
        user.first_name = request.POST.get('first_name', '')
        user.last_name = request.POST.get('last_name', '')
        user.username = request.POST.get('username', '')
        user.email = request.POST.get('email', '')
        user.birth_date = request.POST.get('birth_date', '')
        user.gender = request.POST.get('gender', '')
        user.contact_number = request.POST.get('contact_number', '')
        
        user.save()
        messages.success(request, 'Profile updated successfully!')
        return redirect('admin_profile')

    return render(request, 'admin_panel/profile.html', {'user': user})

@login_required
def admin_program_management(request):
    return render(request, 'admin_panel/progmanagement.html')

@login_required
def admin_child_record(request):
    if request.method == 'POST':
        first_name = request.POST.get('first_name')
        middle_name = request.POST.get('middle_name', '')
        last_name = request.POST.get('last_name')
        gender = request.POST.get('gender')
        date_entered = request.POST.get('date_entered')
        birthday = request.POST.get('birthday')
        age_in_months = request.POST.get('age_in_months')
        weight = request.POST.get('weight')
        height = request.POST.get('height')
        weight_for_age_status = request.POST.get('weight_for_age_status')
        height_for_age_status = request.POST.get('height_for_age_status')
        weight_for_lt_ht_status = request.POST.get('weight_for_lt_ht_status')
        child_image = request.FILES.get('child_image')

        record = ChildRecord.objects.create(
                first_name=first_name,
                middle_name=middle_name,
                last_name=last_name,
                gender=gender,
                date_entered=date_entered,
                birthday=birthday,
                age_in_months=age_in_months,
                weight=weight,
                height=height,
                weight_for_age_status=weight_for_age_status,
                height_for_age_status=height_for_age_status,
                weight_for_lt_ht_status=weight_for_lt_ht_status,
                child_image=child_image
            )
        if child_image:
            record.image = child_image

            messages.success(request, 'Child record added successfully!')
            return redirect('admin_child_record')

    records = ChildRecord.objects.all()
    return render(request, 'admin_panel/child_record.html', {'records': records})

def admin_maternal_record(request):
    if request.method == 'POST':
        try:
            first_name = request.POST.get('first_name')
            middle_name = request.POST.get('middle_name')
            last_name = request.POST.get('last_name')
            status = request.POST.get('status')
            birthday = request.POST.get('birthday')
            age = request.POST.get('age')
            muac = request.POST.get('muac')
            nutritional_status = request.POST.get('nutritional_status')
            four_ps_member = request.POST.get('four_ps_member')
            maternal_image = request.FILES.get('image')

            record = MaternalRecord.objects.create(
                first_name=first_name,
                middle_name=middle_name,
                last_name=last_name,
                status=status,
                birthday=birthday,
                age=age,
                muac=muac,
                nutritional_status=nutritional_status,
                four_ps_member=four_ps_member
            )

            if maternal_image:
                record.image = maternal_image

            record.save()

            messages.success(request, 'Maternal record added successfully!')
            return redirect('admin_maternal_record')

        except Exception as e:
            messages.error(request, f"Error saving record: {str(e)}")
            print(f"Error saving record: {str(e)}")

    records = MaternalRecord.objects.all()
    return render(request, 'admin_panel/maternal_record.html', {'records': records})

@login_required
def admin_reports(request):
    return render(request, 'admin_panel/reports.html')

@login_required
def admin_logout(request):
    logout(request)
    messages.info(request, "You have been logged out.")
    return redirect('login')
