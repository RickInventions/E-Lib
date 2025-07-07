from django.db import models

# Define the Inquiry model
class Inquiry(models.Model):

        # Define the fields for the Inquiry model
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)

        # Define the string representation of the Inquiry model
    def __str__(self):
        return f"{self.subject} - {self.email}"