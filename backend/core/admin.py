from django.contrib import admin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'is_admin', 'points', 'is_staff', 'is_active')
    search_fields = ('username',)
    list_filter = ('is_admin', 'is_staff', 'is_active')
