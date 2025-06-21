# backend/library/serializers.py
from rest_framework import serializers
from .models import Book, BorrowRecord, Category, FeaturedBook, Video
from rest_framework import serializers

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']


class BookSerializer(serializers.ModelSerializer):
    book_uuid = serializers.CharField(read_only=True)
    categories = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        read_only=True
    )
    is_ebook = serializers.SerializerMethodField()
    is_external = serializers.BooleanField(read_only=True)

    available_status = serializers.SerializerMethodField()
    def get_available_status(self, obj):
        return "Available" if obj.available_copies > 0 else "Checked Out"

    class Meta:
        model = Book
        fields = ['id', 'book_uuid', 'title', 'author', 'publisher','categories', 'is_available', 
                 'pdf_file', 'cover_image', 'total_copies', 'available_copies','is_featured',
                 'book_type', 'download_permission', 'is_ebook', 'available_status', 
                 'external_source', 'is_external', 'description', 'publication_date', 'summary']
        extra_kwargs = {
            'pdf_file': {'required': False, 'allow_null': True},
        }
    def get_is_ebook(self, obj):
        return obj.book_type == 'EBOOK'
class BorrowRecordSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = BorrowRecord
        fields = [
            'id', 'user', 'user_email', 'book', 'book_title',
            'borrowed_date', 'return_date', 'is_returned', 'due_date'
        ]
        read_only_fields = ['borrowed_date', 'return_date', 'is_returned', 'due_date']
    
class FeaturedBookSerializer(serializers.ModelSerializer):
    books = serializers.SerializerMethodField()
    is_current = serializers.BooleanField(read_only=True)

    class Meta:
        model = FeaturedBook
        fields = ['id', 'books', 'created_at', 'expires_at', 'is_current']
    
    def get_books(self, obj):
        books = obj.books.all()[:4]  # Ensure maximum 4 books
        return BookSerializer(books, many=True).data

class BookSearchSerializer(serializers.ModelSerializer):
    categories = serializers.SlugRelatedField( 
        many=True,
        slug_field='name',
        queryset=Category.objects.all()
        )
    
    class Meta:
        model = Book
        fields = ['book_uuid', 'title', 'author', 'categories', 'publisher', 'cover_image']

class SearchSuggestionSerializer(serializers.Serializer):
    type = serializers.CharField()
    value = serializers.CharField()
    book_uuid = serializers.CharField(required=False)


class RelatedBookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['book_uuid', 'title', 'author', 'cover_image']

class RelatedVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['id', 'title', 'thumbnail', 'duration']

class VideoSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    is_external = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Video
        fields = [
            'id', 'instructor', 'video_uuid', 'title', 'description', 'category', 'is_featured',
            'video_file', 'thumbnail', 'upload_date', 'duration', 'category_display', 'is_external', 'external_source'
        ]
        read_only_fields = ['upload_date']
        extra_kwargs = {
            'instructor': {'required': True},
            'title': {'required': True},
            'description': {'required': True},
            'video_file': {'required': True},
            'category': {'required': True},
            'thumbnail': {'required': False}
        }

    def validate_category(self, value):
        if not value:
            raise serializers.ValidationError("Category is required")
        return value
    
class PublicBookSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
    
    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'category',
            'cover_image', 'description', 'available_status'
        ]