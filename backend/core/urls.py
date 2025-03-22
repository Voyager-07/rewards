from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompletedTasksView, SignupView, LoginView, UserViewSet, AppTaskViewSet, SubmissionViewSet, get_pending_tasks, user_profile
from django.urls import path
from .views import TaskSubmissionsView

# Create a router for the viewsets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'app-tasks', AppTaskViewSet, basename='app-task')
router.register(r'submissions', SubmissionViewSet, basename='submission')

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('', include(router.urls)),  # Include the viewset routes

    path("completed-tasks/", CompletedTasksView.as_view(), name="completed-tasks"),
    path('submissions/task/<int:task_id>/', TaskSubmissionsView.as_view(), name='task-submissions'),
    path('submissions/verify/<int:submission_id>/', TaskSubmissionsView.as_view(), name='verify-submission'),
    
    path('user-profile/', user_profile, name='user-profile'),
    path('pending-tasks/', get_pending_tasks, name='pending-tasks'),
]



