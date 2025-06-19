# backend/authentication/serializers.py
from rest_framework import serializers
from library.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'role']
        extra_kwargs = {
            'password': {'write_only': True, },
            'first_name': {'required': True},
            'last_name': {'required': True}
            }

    def create(self, validated_data):
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