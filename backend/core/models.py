from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    name = models.CharField(max_length=255)
    is_admin = models.BooleanField(default=False)
    points = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.is_admin = True
        super().save(*args, **kwargs)
    
    def completed_tasks(self):
        return AppTask.objects.filter(submissions__user=self, submissions__approved=True).distinct()

class AppTask(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    points = models.IntegerField(default=0)
    app_link = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Submission(models.Model):
    user = models.ForeignKey(CustomUser, related_name="submissions", on_delete=models.CASCADE)
    task = models.ForeignKey(AppTask, related_name="submissions", on_delete=models.CASCADE)
    screenshot = models.ImageField(upload_to='submissions/')
    approved = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Submission by {self.user.username} for task {self.task.name}"
