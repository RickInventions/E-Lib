import os
from rest_framework.generics import ListAPIView
from library.models import User
from library.serializers import UserMiniSerializer
from rest_framework.permissions import IsAdminUser
from django.utils import timezone
from rest_framework.parsers import JSONParser
from rest_framework.decorators import parser_classes
from datetime import timedelta
from django.utils.text import slugify
from wsgiref.util import FileWrapper
from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from django.db import models
from library.models import Book, BorrowRecord, Category, User, Video, ReadingSession  
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import BorrowRecord, Category, Book, FeaturedBook
from rest_framework.pagination import PageNumberPagination
from .serializers import BookSearchSerializer, BorrowRecordSerializer, CategorySerializer, BookSerializer, FeaturedBookSerializer, PublicBookSerializer, RelatedBookSerializer, RelatedVideoSerializer, VideoSerializer
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.views.decorators.cache import cache_control
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control


class CategoryView(APIView):
    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not request.user.is_authenticated or request.user.role != 'admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    @parser_classes([JSONParser])
    def patch(self, request, pk=None):
        if not request.user.is_authenticated or request.user.role != 'admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        if not request.user.is_authenticated or request.user.role != 'admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        
        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CategoryReportView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        categories = Category.objects.annotate(
            total_books=Count('book'),
            available_books=Count('book', filter=Q(book__is_available=True)),
            ebooks=Count('book', filter=Q(book__book_type='EBOOK')),
            physical_books=Count('book', filter=Q(book__book_type='PHYSICAL'))
        ).order_by('name')
        
        data = []
        for cat in categories:
            data.append({
                'category': cat.name,
                'total_books': cat.total_books,
                'available_books': cat.available_books,
                'ebooks': cat.ebooks,
                'physical_books': cat.physical_books
            })
            
        return Response(data)
    
class BookListView(APIView):
    def get(self, request, *args, **kwargs):
        books = Book.objects.filter(is_available=True)
        
        category = request.query_params.get('category') or kwargs.get('category')
        if category:
            books = books.filter(categories__name__icontains=category)
        
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)

class BookCategoryView(APIView):
    def get(self, request, category):
        books = Book.objects.filter(
            is_available=True,
            categories__name__icontains=category
        )
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)
    
class BookDetailView(APIView):
    def get(self, request, book_uuid):
        book = get_object_or_404(Book, book_uuid=book_uuid)
        serializer = BookSerializer(book)
        return Response(serializer.data)
    
    
class BorrowBookView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, book_uuid):
        try:
            days = int(request.data.get('days', 14))
            book = Book.objects.get(book_uuid=book_uuid)
            record = book.borrow_book(request.user, days)
            return Response({
                "message": f"Book borrowed for {days} days",
                "due_date": record.due_date
            }, status=201)
        except Book.DoesNotExist:
            return Response({"error": "Book not found"}, status=404)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            return Response({"error": "An unexpected error occurred"}, status=500)
        
class SearchPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class BookSearchView(APIView):
    pagination_class = SearchPagination
    
    def get(self, request):
        query = request.GET.get('q', '').strip()
        if not query:
            return Response([])
        
        books = Book.objects.annotate(
             relevance=models.Case(
                models.When(title__icontains=query, then=3),
                models.When(author__icontains=query, then=2),
                models.When(publisher__icontains=query, then=1),
                default=0,
                output_field=models.IntegerField()
            )
        ).filter(
            Q(title__icontains=query) |
            Q(author__icontains=query) |
            Q(publisher__icontains=query) |
            Q(description__icontains=query)
        ).order_by('-relevance', 'title')

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(books, request)
        serializer = BookSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
class SearchSuggestionsView(APIView):
    def get(self, request):
        query = request.GET.get('q', '').strip()[:50]
        if not query:
            return Response([])
        
        suggestions = []
        
        titles = Book.objects.filter(
            title__icontains=query
        ).values_list('title', flat=True).distinct()[:3]
        suggestions.extend([{'type': 'title', 'value': t} for t in titles])
        
        authors = Book.objects.filter(
            author__icontains=query
        ).values_list('author', flat=True).distinct()[:3]
        suggestions.extend([{'type': 'author', 'value': a} for a in authors])
        
        categories = Category.objects.filter(
            name__icontains=query
        ).values_list('name', flat=True)[:3]
        suggestions.extend([{'type': 'category', 'value': c} for c in categories])
        
        publishers = Book.objects.filter(
            publisher__icontains=query
        ).values_list('publisher', flat=True).distinct()[:3]
        suggestions.extend([{'type': 'publisher', 'value': p} for p in publishers])
        
        if len(query) >= 6 and query.startswith('BOOK-'):
            book_matches = Book.objects.filter(
                book_uuid__iexact=query
            )[:1]
            if book_matches:
                book = book_matches[0]
                suggestions.append({
                    'type': 'book',
                    'value': book.title,
                    'book_uuid': book.book_uuid
                })
        
        return Response(suggestions[:10])

class UserBorrowedBooks(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        records = BorrowRecord.objects.filter(user=request.user, is_returned=False)
        serializer = BorrowRecordSerializer(records, many=True)
        return Response(serializer.data)
    
class UserBorrowHistory(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        records = BorrowRecord.objects.filter(
            user=request.user,
            is_returned=True
        ).order_by('-return_date')
        serializer = BorrowRecordSerializer(records, many=True)
        return Response(serializer.data)
    
class FeaturedBookView(APIView):
    def get(self, request):
        featured_set = FeaturedBook.objects.filter(
            expires_at__gt=timezone.now()
        ).order_by('-created_at').first()

        if not featured_set:
            try:
                featured_set = FeaturedBook.create_featured_set()
            except Exception as e:
                return Response({"books": [], "message": str(e)}, status=200)

        serializer = FeaturedBookSerializer(featured_set)
        return Response(serializer.data)

class AdminFeaturedBookView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        """Force create new featured set (admin only)"""
        try:
            featured_set = FeaturedBook.create_featured_set()
            serializer = FeaturedBookSerializer(featured_set)
            return Response(serializer.data, status=201)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)
        
class AdminBookView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        if not request.user.is_authenticated or request.user.role != 'admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = BookSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, book_uuid):
        book = get_object_or_404(Book, book_uuid=book_uuid)
        book.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    def patch(self, request, book_uuid):
        book = get_object_or_404(Book, book_uuid=book_uuid)
        serializer = BookSerializer(book, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class AdminBorrowRecords(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        records = BorrowRecord.objects.all().select_related('user', 'book')
        serializer = BorrowRecordSerializer(records, many=True)
        return Response(serializer.data)
    
class AdminReturnView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, book_uuid, pk):
        try:
            record = BorrowRecord.objects.get(
                pk=pk,
                book__book_uuid=book_uuid,
                is_returned=False
            )
            
            record.book.available_copies += 1
            record.book.save()
            
            record.is_returned = True
            record.return_date = timezone.now()
            record.save()
            
            return Response({"message": "Book successfully returned"})
            
        except BorrowRecord.DoesNotExist:
            return Response(
                {"error": "Active borrow record not found"},
                status=404
            )
        
class AdminBorrowView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        active_borrows = BorrowRecord.objects.filter(
            is_returned=False
        ).select_related('user', 'book')
        serializer = BorrowRecordSerializer(active_borrows, many=True)
        return Response(serializer.data)

class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        stats = {
            "total_active_borrows": BorrowRecord.objects.filter(is_returned=False).count(),
            "total_overdue": BorrowRecord.objects.filter(
                is_returned=False,
                due_date__lt=timezone.now()
            ).count(),
            "most_borrowed_books": Book.objects.annotate(
                borrow_count=models.Count('borrowrecord')
            ).order_by('-borrow_count')[:5].values('title', 'borrow_count'),
            "recent_borrows": BorrowRecord.objects.order_by('-borrowed_date')[:5]
        }
        return Response(stats)
    
class DownloadBookView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, book_uuid):
        book = get_object_or_404(Book, book_uuid=book_uuid)
        
        if book.download_permission == 'NONE':
            return Response({"error": "Downloads not allowed for this book"}, status=403)
        
        if book.download_permission == 'AUTH' and not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)
        
        if not book.pdf_file:
            return Response({"error": "File not available"}, status=404)
        
        filename = f"{slugify(book.title)}.pdf"
        response = FileResponse(
            book.pdf_file.open(),
            content_type='application/pdf',
            as_attachment=True,
            filename=filename
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
    
class LibraryReports(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        data = {
            'total_books': Book.objects.count(),
            'available_books': Book.objects.filter(available_copies__gt=0).count(),
            'total_users': User.objects.count(),
            'active_borrows': BorrowRecord.objects.filter(is_returned=False).count(),
            'categories': Category.objects.count(),
            'videos': Video.objects.count(),
            'video_external_sources': Video.objects.exclude(external_source__isnull=True).count(),
            'physical_books': Book.objects.filter(book_type='PHYSICAL').count(),
            'e_books': Book.objects.filter(book_type='EBOOK').count(),
            'external_sources': Book.objects.exclude(external_source__isnull=True).count(),
            'total_videos': Video.objects.count(),
            'video_by_category': {
                category[1]: Video.objects.filter(category=category[0]).count()
                for category in Video.VIDEO_CATEGORIES
            },
            'overdue_books': BorrowRecord.objects.filter(
                is_returned=False,
                due_date__lt=timezone.now()
            ).count()
        }
        return Response(data)

class LibraryStatsView(APIView):
    def get(self, request):
        stats = {
            'total_books': Book.objects.count(),
            'available_books': Book.objects.filter(is_available=True).count(),
            'total_videos': Video.objects.count(),
            'total_categories': Category.objects.count(),
            'total_users': User.objects.count()
        }
        return Response(stats)

class PublicBookListView(APIView):
    def get(self, request):
        books = Book.objects.filter(is_available=True)
        serializer = PublicBookSerializer(books, many=True)   
        return Response(serializer.data)

class PublicBookDetailView(APIView):
    def get(self, request, book_uuid):
        book = get_object_or_404(Book, book_uuid=book_uuid, is_available=True)
        serializer = PublicBookSerializer(book)
        return Response(serializer.data)
    
class EBookListView(APIView):
    def get(self, request):
        ebooks = Book.objects.filter(book_type='EBOOK', is_available=True)
        print(ebooks) 
        serializer = BookSerializer(ebooks, many=True)
        return Response(serializer.data)

class OverdueBooksView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        overdue = BorrowRecord.objects.filter(
            is_returned=False,
            due_date__lt=timezone.now()
        )
        serializer = BorrowRecordSerializer(overdue, many=True)
        return Response(serializer.data)

class ReturnBookView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, book_uuid):
        try:
            record = BorrowRecord.objects.get(
                book__book_uuid=book_uuid,
                user=request.user,
                )
            if not record.is_returned:
                record.book.return_book()
                record.is_returned = True
                record.return_date = timezone.now()
                record.save()
                return Response({"message": "Book returned Succesfully"})
            return Response({"error": "Book already returned"}, status=400)
        except BorrowRecord.DoesNotExist:
            return Response({"error": "No active borrow record found"}, status=404)
        
@method_decorator(cache_control(private=True, max_age=3600), name='get')
class PDFViewerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, book_uuid):
        book = get_object_or_404(Book, book_uuid=book_uuid, book_type='EBOOK')
        
        if not book.pdf_file:
            return Response({"error": "PDF not available"}, status=404)
        
        ReadingSession.objects.get_or_create(
            user=request.user,
            book=book,
            defaults={'last_page': 1}
        )
        
        response = FileResponse(
            book.pdf_file.open(),
            content_type='application/pdf'
        )
        response['Content-Disposition'] = f'inline; filename="{slugify(book.title)}.pdf"'
        return response
class ReadingSessionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, book_uuid):
        book = get_object_or_404(Book, book_uuid=book_uuid)
        session, created = ReadingSession.objects.update_or_create(
            user=request.user,
            book=book,
            defaults={'last_page': request.data.get('page', 1)}
        )
        return Response({"message": "Reading progress saved"})
    

class VideoListView(APIView):
    def get(self, request, *args, **kwargs):
        videos = Video.objects.all()
        
        category = request.query_params.get('category') or kwargs.get('category')
        if category:
            videos = videos.filter(category__iexact=category)
        
        serializer = VideoSerializer(videos, many=True)
        return Response(serializer.data)

class VideoCategoryView(APIView):
    def get(self, request, category):
        videos = Video.objects.filter(category__iexact=category)
        serializer = VideoSerializer(videos, many=True)
        return Response(serializer.data)

class VideoDetailView(APIView):
    def get(self, request, video_uuid):
        try:
            video = Video.objects.get(video_uuid=video_uuid)
            serializer = VideoSerializer(video)
            return Response(serializer.data)
        except Video.DoesNotExist:
            return Response({"error": "Video not found"}, status=404)

class AdminVideoView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = VideoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, video_uuid):
        try:
            video = Video.objects.get(video_uuid=video_uuid)
            serializer = VideoSerializer(video, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Video.DoesNotExist:
            return Response({"error": "Video not found"}, status=status.HTTP_404_NOT_FOUND)
    def delete(self, request, video_uuid):
        try:
            video = Video.objects.get(video_uuid=video_uuid)
            video.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Video.DoesNotExist:
            return Response({"error": "Video not found"}, status=status.HTTP_404_NOT_FOUND)
    
class BookRecommendations(APIView):
    def get(self, request, book_uuid):
        book = get_object_or_404(Book, book_uuid=book_uuid)
        related_books = book.get_enhanced_recommendations()
        serializer = RelatedBookSerializer(related_books, many=True)
        return Response(serializer.data)

class VideoRecommendations(APIView):
    def get(self, request, video_id):
        video = get_object_or_404(Video, pk=video_id)
        related_videos = video.get_related_videos()
        serializer = RelatedVideoSerializer(related_videos, many=True)
        return Response(serializer.data)    

class VideoStreamView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, video_id):
        video = get_object_or_404(Video, pk=video_id)
        path = video.video_file.path
        
        def file_iterator(file_path, chunk_size=8192):
            with open(file_path, 'rb') as f:
                while True:
                    chunk = f.read(chunk_size)
                    if not chunk:
                        break
                    yield chunk

        response = StreamingHttpResponse(
            file_iterator(path),
            content_type='video/mp4'
        )
        response['Content-Length'] = os.path.getsize(path)
        response['Content-Disposition'] = f'inline; filename="{os.path.basename(path)}"'
        return response
    
class ExternalSourcesReport(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        external_books = Book.objects.exclude(external_source__isnull=True)
        bookserializer = BookSerializer(external_books, many=True)
        videoserializer = VideoSerializer(external_books, many=True)
        return Response({
            'count': external_books.count(),
            'books': bookserializer.data,
            'videos': videoserializer.data
        })
    
def stream_video(request, video_id):
    video = Video.objects.get(id=video_id)
    response = FileResponse(open(video.video_file.path, 'rb'))
    response['Content-Type'] = 'video/mp4'
    response['Content-Disposition'] = f'inline; filename="{video.title}.mp4"'
    return response

class AdminUserListView(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserMiniSerializer
    permission_classes = [IsAdminUser]

    def delete(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if request.user == user:
            return Response({'error': 'Cannot delete yourself'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
