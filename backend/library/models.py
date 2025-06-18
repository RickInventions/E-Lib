# backend/library/models.py
import uuid
from django.utils import timezone
from datetime import timedelta
from django.db import models
from django.db.models import Count
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator
import random
from django.db.models.signals import post_save
from django.dispatch import receiver

class User(AbstractUser):
    ROLES = (('user', 'Member'), ('admin', 'Admin'))
    role = models.CharField(max_length=10, choices=ROLES, default='user')
    first_name = models.CharField(max_length=30, blank=False)  # Changed to required
    last_name = models.CharField(max_length=30, blank=False)  # Changed to required


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name
    
    
class BorrowRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey('Book', on_delete=models.CASCADE)
    borrowed_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()
    return_date = models.DateTimeField(null=True, blank=True)
    is_returned = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'book'],
                condition=models.Q(is_returned=False),
                name='unique_active_borrow'
            )
        ]

def generate_book_uuid():
    return f"BOOK-{uuid.uuid4().hex[:6].upper()}"

class Book(models.Model):
    BOOK_TYPES = [
        ('PHYSICAL', 'Physical'),
        ('EBOOK', 'Ebook')
    ]
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=100)
    is_available = models.BooleanField(default=True)    
    pdf_file = models.FileField(upload_to='books/pdfs/', null=True, blank=True)
    cover_image = models.ImageField(upload_to='books/covers/', null=True, blank=True)
    description = models.TextField(blank=False)
    publication_date = models.DateField(null=True, blank=True)
    summary = models.TextField(blank=True)
    publisher = models.CharField(max_length=200, blank=True)
    total_copies = models.PositiveIntegerField(default=1)
    available_copies = models.PositiveIntegerField(default=1)
    allow_download = models.BooleanField(default=False)
    book_type = models.CharField(max_length=10, choices=BOOK_TYPES, default='PHYSICAL')
    categories = models.ManyToManyField(Category)
    is_featured = models.BooleanField(default=False)
    external_source = models.URLField(
        blank=True,
        null=True,
        help_text="Link to external source if not hosted locally"
    )
    @property
    def is_external(self):
        return bool(self.external_source)
    
    book_uuid = models.CharField(
        max_length=12,
        unique=True,
        default=generate_book_uuid,
        editable=False,
    )
    download_permission = models.CharField(
        max_length=10,
        choices=[('ALL', 'All Users'), ('AUTH', 'Authenticated Only'), ('NONE', 'None')],
        default='NONE'
    )

    def borrow_book(self, user, days):
        if self.book_type == 'EBOOK':
            raise ValueError("E-Books cannot be borrowed")
            
        if days > 30 or days < 1:
            raise ValueError("Borrowing period must be between 1-30 days")     
         
        if BorrowRecord.objects.filter(user=user, book=self, is_returned=False).exists():
            raise ValueError("You already have an active borrow for this book")
                  
        if self.available_copies <= 0:
            raise ValueError("No copies available")
            
        self.available_copies -= 1
        self.save()
        
        due_date = timezone.now() + timedelta(days=days)
        return BorrowRecord.objects.create(
            user=user,
            book=self,
            due_date=due_date
        )
    def return_book(self):
        self.available_copies += 1
        self.save()
      
    def get_related_books(self):
        """Get books with similar categories"""
        return Book.objects.filter(
            categories__in=self.categories.all()
        ).exclude(
            id=self.id
        ).annotate(
            common_categories=Count('categories')
        ).order_by('-common_categories', '?')[:4]  # 4 random books with most categories in comm
    
    def get_enhanced_recommendations(self):
        """Combine category-based and borrowing-pattern based recommendations"""
        # Category-based
        category_books = self.get_related_books()
        
        # Borrowing-pattern based (books often borrowed together)
        frequently_co_borrowed = Book.objects.filter(
            borrowrecord__user__in=User.objects.filter(
                borrowrecord__book=self
            )
        ).exclude(
            id=self.id
        ).annotate(
            borrow_count=Count('borrowrecord')
        ).order_by('-borrow_count')[:2]
        
        # Combine and remove duplicates
        all_recs = list(category_books) + list(frequently_co_borrowed)
        unique_recs = list({b.id: b for b in all_recs}.values())
        return unique_recs[:4]

    def __str__(self):
        return f"{self.title} ({self.book_uuid})"
    
    class Meta:
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['author']),
            models.Index(fields=['publisher']),
        ]

class FeaturedBook(models.Model):
    books = models.ManyToManyField('Book')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ['-created_at']
        get_latest_by = 'created_at'

    def save(self, *args, **kwargs):
        # Set expiration 12 hours from now if not specified
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(hours=12)
        super().save(*args, **kwargs)
        
    @classmethod
    def create_featured_set(cls):
        available_books = Book.objects.filter(is_available=True)
        count = available_books.count()
        
        if count < 4:
            # If not enough books, feature all available or none
            featured_books = list(available_books) if count > 0 else []
        else:
            featured_books = random.sample(list(available_books), 4)
        
        featured_set = cls.objects.create(
            expires_at=timezone.now() + timezone.timedelta(hours=12)
        )
        featured_set.books.set(featured_books)
        return featured_set

    def is_current(self):
        return timezone.now() < self.expires_at

@receiver(post_save, sender=Book)
def check_featured_books(sender, instance, **kwargs):
    """Ensure we always have a current featured set"""
    if not FeaturedBook.objects.filter(expires_at__gt=timezone.now()).exists():
        try:
            FeaturedBook.create_featured_set()
        except:
            pass  # Silently fail if there's an issue creating featured set

class ReadingSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    last_page = models.PositiveIntegerField(default=1)
    last_accessed = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'book']


class Video(models.Model):
    VIDEO_CATEGORIES = (
        ('TUTORIAL', 'Tutorial'),
        ('LECTURE', 'Lecture'),
        ('DOCUMENTARY', 'Documentary'),
        ('OTHER', 'Other')
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=VIDEO_CATEGORIES, default='DOCUMENTARY')
    video_file = models.FileField(
        upload_to='videos/',
        validators=[FileExtensionValidator(allowed_extensions=['mp4', 'webm', 'ogg'])]
    )
    thumbnail = models.ImageField(upload_to='video_thumbnails/')
    upload_date = models.DateTimeField(auto_now_add=True)
    is_featured = models.BooleanField(default=False)
    duration = models.PositiveIntegerField(help_text="Duration in seconds", default=0)

    def __str__(self):
        return f"{self.title} ({self.get_category_display()})"