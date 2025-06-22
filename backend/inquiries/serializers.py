from rest_framework import serializers
from .models import Inquiry

class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquiry
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at', 'is_resolved']
        read_only_fields = ['created_at', 'is_resolved']