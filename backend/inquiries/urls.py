# inquiries/urls.py
from django.urls import path
from .views import SubmitInquiryView, InquiryListView

app_name = "inquiries"
urlpatterns = [
    path('contact/', SubmitInquiryView.as_view(), name='submit-inquiry'),
    path('admin/inquiries/', InquiryListView.as_view(), name='inquiry-list'),
]