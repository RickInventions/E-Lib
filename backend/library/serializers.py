from rest_framework import serializers
from .models import Book, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']

class BookSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()  # Show category name instead of ID
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )

    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'category', 'category_id', 'is_available', 
                 'pdf_file', 'cover_image', 'description']
        extra_kwargs = {
            'pdf_file': {'required': False, 'allow_null': True},
        }