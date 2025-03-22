from rest_framework import serializers
from .models import AppTask, CustomUser, Submission

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'name', 'password', 'points', 'is_admin'] 
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user



class SubmissionSerializer(serializers.ModelSerializer):
    task_name = serializers.CharField(source='task.name', read_only=True)
    screenshot_url = serializers.SerializerMethodField()
    user = UserSerializer(read_only=True)  # Serialize the user object

    class Meta:
        model = Submission
        fields = ['id', 'user', 'task', 'task_name', 'screenshot', 'screenshot_url', 'approved', 'submitted_at']
        read_only_fields = ['user', 'approved', 'submitted_at', 'task_name', 'screenshot_url']

    def get_screenshot_url(self, obj):
        request = self.context.get('request')
        if obj.screenshot and request:
            return request.build_absolute_uri(obj.screenshot.url)
        return None

    def validate_screenshot(self, value):
        if not value.name.lower().endswith(('png', 'jpg', 'jpeg')):
            raise serializers.ValidationError("Only PNG, JPG, or JPEG files are allowed.")
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class AppTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppTask
        fields = ['id', 'name', 'description', 'points', 'app_link']
