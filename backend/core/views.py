from rest_framework import status, generics, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser, SAFE_METHODS
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import AppTask, CustomUser, Submission
from .serializers import AppTaskSerializer, SubmissionSerializer, UserSerializer

# --------------------------------------
# Generate JWT Tokens
# --------------------------------------
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh['is_admin'] = user.is_admin
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}

# --------------------------------------
# User Signup View
# --------------------------------------
class SignupView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response({'message': 'User created successfully', 'tokens': tokens}, status=status.HTTP_201_CREATED)

# --------------------------------------
# User Login View
# --------------------------------------
class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)

        if user:
            tokens = get_tokens_for_user(user)
            return Response({'message': 'Login successful', 'tokens': tokens, 'user': UserSerializer(user).data})
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    def options(self, request, *args, **kwargs):
        """Handle preflight CORS OPTIONS request."""
        response = Response()
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

# --------------------------------------
# Custom Permission: Admin or ReadOnly
# --------------------------------------
class IsAdminOrReadOnly(IsAuthenticated):
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS or (request.user and request.user.is_staff)

# --------------------------------------
# User Management ViewSet
# --------------------------------------
class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    # @action(detail=False, methods=["get"], url_path="me")
    def get_current_user(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    def get_permissions(self):
        if self.action in ['list', 'create', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.is_staff:
            return CustomUser.objects.all()
        return CustomUser.objects.filter(id=self.request.user.id)

# --------------------------------------
# AppTask ViewSet (Admin or ReadOnly)
# --------------------------------------
class AppTaskViewSet(viewsets.ModelViewSet):
    queryset = AppTask.objects.all()
    serializer_class = AppTaskSerializer
    permission_classes = [IsAdminOrReadOnly]

# --------------------------------------
# Submission ViewSet (Admin Only for Approval)
# --------------------------------------
class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer

    def get_permissions(self):
        if self.action in ['update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def update(self, request, *args, **kwargs):
        submission = self.get_object()
        approved = request.data.get('approved')

        if approved and not submission.approved:
            submission.approved = True
            submission.user.points += submission.task.points
            submission.user.save()
            submission.save()

        return Response({'message': 'Submission updated successfully'}, status=status.HTTP_200_OK)


from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Submission, AppTask
from .serializers import SubmissionSerializer
from django.db import transaction
from rest_framework import status

class TaskSubmissionsView(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can access

    def get(self, request, task_id):
        # Ensure that the task exists
        try:
            task = AppTask.objects.get(id=task_id)
        except AppTask.DoesNotExist:
            return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Get all submissions for the task
        submissions = Submission.objects.filter(task=task)
        serializer = SubmissionSerializer(submissions, many=True, context={'request': request})
        return Response(serializer.data)
    
    def patch(self, request, submission_id):
        # ✅ Restrict verification to admin users
        if not request.user.is_admin:
            return Response({"detail": "Permission denied. Only admins can verify submissions."}, status=status.HTTP_403_FORBIDDEN)

        try:
            submission = Submission.objects.select_related("user", "task").get(id=submission_id)
        except Submission.DoesNotExist:
            return Response({"detail": "Submission not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # ✅ Prevent double verification
        if submission.approved:
            return Response({"detail": "Submission already verified."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():  # ✅ Ensures data consistency
            submission.approved = True
            submission.save()

            # ✅ Update user points
            submission.user.points += submission.task.points
            submission.user.save()

        return Response({"detail": "Submission verified and points updated."}, status=status.HTTP_200_OK)

class CompletedTasksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        completed_tasks = AppTask.objects.filter(submissions__user=request.user, submissions__approved=True).distinct()
        serializer = AppTaskSerializer(completed_tasks, many=True)
        return Response(serializer.data)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import AppTask, Submission
from .serializers import AppTaskSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_tasks(request):
    user = request.user

    # Get all task IDs that the user has already submitted
    submitted_task_ids = Submission.objects.filter(user=user).values_list('task_id', flat=True)

    # Get only tasks that the user has NOT submitted
    pending_tasks = AppTask.objects.exclude(id__in=submitted_task_ids)

    serializer = AppTaskSerializer(pending_tasks, many=True)
    return Response(serializer.data)



from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    return Response({
        "username": user.username,
        "name": user.name,
        "total_points": user.points,
    })
