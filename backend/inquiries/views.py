# inquiries/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Inquiry
from .serializers import InquirySerializer
from rest_framework.permissions import IsAdminUser

class SubmitInquiryView(APIView):
    def post(self, request):
        serializer = InquirySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InquiryListView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        inquiries = Inquiry.objects.all().order_by('-created_at')
        serializer = InquirySerializer(inquiries, many=True)
        return Response(serializer.data)
    
    def patch(self, request, pk=None):
        try:
            inquiry = Inquiry.objects.get(pk=pk)
        except Inquiry.DoesNotExist:
            return Response({'error': 'Inquiry not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = InquirySerializer(inquiry, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        try:
            inquiry = Inquiry.objects.get(pk=pk)
        except Inquiry.DoesNotExist:
            return Response({'error': 'Inquiry not found'}, status=status.HTTP_404_NOT_FOUND)
        
        inquiry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)