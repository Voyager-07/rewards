from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static

from backend import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),  # Include all core app URLs
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
