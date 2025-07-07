from django.urls import path
from .views import SubmitInquiryView, InquiryListView

app_name = "inquiries"
urlpatterns = [
        # URL pattern for submitting an inquiry
    path('contact/', SubmitInquiryView.as_view(), name='submit-inquiry'), # Submit an inquiry
        # URL pattern for listing inquiries
    path('admin/inquiries/', InquiryListView.as_view(), name='inquiry-list'), # List inquiries
    
        # URL pattern for retrieving an inquiry
    path('admin/inquiries/<int:pk>/', InquiryListView.as_view(), name='inquiry-detail'), # Retrieve an inquiry

]