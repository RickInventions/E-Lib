# backend/library/urls.py
from django.urls import path
from .views import (
    AdminBorrowView, AdminFeaturedBookView, AdminReturnView, AdminVideoView, BookDetailView, BookListView,
    AdminBookView, BookRecommendations, BookSearchView, BorrowBookView, CategoryReportView, 
    CategoryView, ExternalSourcesReport, LibraryStatsView, PDFViewerView, ReadingSessionView, ReturnBookView, 
    SearchSuggestionsView, UserBorrowHistory, UserBorrowedBooks, DownloadBookView, EBookListView, 
    LibraryReports, OverdueBooksView, VideoDetailView, VideoListView, VideoRecommendations, FeaturedBookView
)
app_name = "library"  
urlpatterns = [
    # Public endpoints
    path('books/', BookListView.as_view(), name='book-list'),
    path('categories/', CategoryView.as_view(), name='category-list'),
    path('ebooks/', EBookListView.as_view(), name='ebook-list'),
    path('search/', BookSearchView.as_view(), name='book-search'),
    path('search/suggestions/', SearchSuggestionsView.as_view(), name='search-suggestions'),
    path('featured/', FeaturedBookView.as_view(), name='download-book'),
    path('admin/featured/refresh/', AdminFeaturedBookView.as_view(), name='refresh-featured'),
    path('books/<str:book_uuid>/', BookDetailView.as_view(), name='book-detail'),
    path('books/<str:book_uuid>/download/', DownloadBookView.as_view(), name='download-book'),
    path('books/category/<str:category>/', BookListView.as_view(), name='book-category'),
    path('videos/category/<str:category>/', VideoListView.as_view(), name='video-category'),
    path('stats/', LibraryStatsView.as_view(), name='library-stats'),

    
    # User endpoints
    path('books/<str:book_uuid>/borrow/', BorrowBookView.as_view(), name='borrow-book'),
    path('books/return/<str:book_uuid>/', ReturnBookView.as_view(), name='return-book'),
    path('user/borrowed/', UserBorrowedBooks.as_view(), name='user-borrowed'),
    path('user/borrow-history/', UserBorrowHistory.as_view(), name='borrow-history'),
    path('books/<str:book_uuid>/read/', PDFViewerView.as_view(), name='read-book'),
    path('books/<str:book_uuid>/reading-progress/', ReadingSessionView.as_view(), name='reading-progress'),
    path('books/<str:book_uuid>/recommendations/', BookRecommendations.as_view(), name='book-recommendations'),
    path('videos/<int:video_id>/recommendations/', VideoRecommendations.as_view(), name='video-recommendations'),
    
    # Video endpoints
    path('videos/', VideoListView.as_view(), name='video-list'),
    path('videos/<int:video_id>/', VideoDetailView.as_view(), name='video-detail'),
    path('admin/videos/', AdminVideoView.as_view(), name='admin-video-add'),
    path('admin/videos/<int:video_id>/', AdminVideoView.as_view(), name='admin-video-edit'),# 
        
    # Admin endpoints
    path('admin/books/', AdminBookView.as_view(), name='admin-book-add'),
    path('admin/categories/', CategoryView.as_view(), name='admin-category-add'),
    path('admin/reports/', LibraryReports.as_view(), name='library-reports'),
    path('admin/reports/categories/', CategoryReportView.as_view(), name='category-report'),
    path('admin/overdue/', OverdueBooksView.as_view(), name='overdue-books'),
    path('admin/borrows/active/', AdminBorrowView.as_view(), name='admin-active-borrows'),
    path('admin/borrows/return/', AdminReturnView.as_view(), name='admin-return-book'),
    path('admin/reports/external-sources/', ExternalSourcesReport.as_view(), name='external-sources-report'),
]