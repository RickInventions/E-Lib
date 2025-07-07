from rest_framework import serializers
from library.models import User

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    - Handles serialization and deserialization of user data.
    - Ensures password is write-only for security.
    - Requires first_name and last_name fields.
    - Used for user registration, profile retrieval, and updates.
    - Edge case: Prevents password from being exposed in API responses.
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'role']
        extra_kwargs = {
            'password': {'write_only': True, },
            'first_name': {'required': True},
            'last_name': {'required': True}
            }

    def create(self, validated_data):
        """
        Custom create method for user registration.
        - Extracts first_name and last_name from validated data.
        - Uses create_user to ensure password is hashed.
        - Sets user role, defaults to 'user' if not provided.
        - Edge case: Handles missing first/last name by defaulting to empty string.
        """
        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'user')
        )
        user.first_name = first_name
        user.last_name = last_name
        user.save()
        return user