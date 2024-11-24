from rest_framework import serializers
from .models import *

class Fortune500EntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Fortune500Entry
        fields = '__all__'

class CriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Criteria
        fields = '__all__'
        
class AHPResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = AHPResult
        fields = '__all__'