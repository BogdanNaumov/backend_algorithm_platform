from rest_framework import serializers
from .models import Algorithm

class AlgorithmSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    tags_list = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    can_moderate = serializers.SerializerMethodField()

    class Meta:
        model = Algorithm
        fields = [
            'id', 'name', 'tegs', 'description', 'code', 'author_name',
            'status', 'status_display', 'moderated_by', 'moderated_at',
            'rejection_reason', 'created_at', 'updated_at', 'tags_list',
            'can_edit', 'can_moderate'
        ]
        read_only_fields = [
            'id', 'author_name', 'moderated_by', 'moderated_at',
            'created_at', 'updated_at', 'status_display', 'tags_list',
            'can_edit', 'can_moderate'
        ]

    def get_tags_list(self, obj):
        return obj.get_tags_list()

    def get_can_edit(self, obj):
        request = self.context.get('request')
        if request:
            return obj.can_edit(request.user)
        return False

    def get_can_moderate(self, obj):
        request = self.context.get('request')
        if request:
            return obj.can_moderate(request.user)
        return False

    def create(self, validated_data):
        """
        Устанавливаем автора из запроса (если есть), и статус — на модерации по умолчанию.
        """
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            validated_data['author_name'] = request.user.username
        else:
            validated_data['author_name'] = validated_data.get('author_name', 'anonymous')
        validated_data.setdefault('status', Algorithm.STATUS_PENDING)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        При обновлении — если алгоритм был одобрен/отклонён — сбрасываем модерацию.
        """
        if instance.status in [Algorithm.STATUS_APPROVED, Algorithm.STATUS_REJECTED]:
            instance.reset_moderation()
        return super().update(instance, validated_data)
