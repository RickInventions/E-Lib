from django.urls import path
from .views import BookListView, AdminBookView, CategoryView

urlpatterns = [
    path('books/', BookListView.as_view(), name='book-list'),
    path('admin/books/', AdminBookView.as_view(), name='admin-book-add'),
    path('categories/', CategoryView.as_view(), name='category-list'),  # Public GET
    path('admin/categories/', CategoryView.as_view(), name='admin-category-add'),  # Admin POST
]