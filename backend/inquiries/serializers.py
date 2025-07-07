from rest_framework import serializers
from .models import Inquiry

# Define the InquirySerializer
class InquirySerializer(serializers.ModelSerializer):

        # Define the fields for the InquirySerializer
    class Meta:
        model = Inquiry
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at', 'is_resolved']
        read_only_fields = ['created_at', 'is_resolved']