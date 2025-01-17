from django.db import models

class Fortune500Entry(models.Model):
    rank = models.IntegerField()
    name = models.CharField(max_length=255)
    revenue = models.DecimalField(max_digits=15, decimal_places=2)
    revenue_percent_change = models.CharField(max_length=10, null=True, blank=True)
    profits = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    profits_percent_change = models.CharField(max_length=10, null=True, blank=True)
    assets = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    employees = models.IntegerField(null=True, blank=True)
    change_in_rank = models.IntegerField(null=True, blank=True)
    years_on_list = models.IntegerField(null=True, blank=True)
    sector = models.CharField(max_length=100, null=True, blank=True)
    industry = models.CharField(max_length=100, null=True, blank=True)
    last_scraped = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['rank']
        unique_together = ('name', 'last_scraped')

    def __str__(self):
        return f"{self.rank}: {self.name} - {self.sector} - {self.industry}"


class AHPResult(models.Model):
    criteria = models.JSONField(default=list, help_text="Selected criteria with weights")  
    weights = models.JSONField(default=list, help_text="Weights for each criterion")  
    rankings = models.JSONField(default=list, help_text="Rankings with calculated scores")  
    timestamp = models.DateTimeField(null=True ,auto_now_add=True) 

    def __str__(self):
        return f"AHP Result ({self.timestamp})"
    

class TopsisResult(models.Model):
    criteria = models.JSONField(default=list, help_text="Selected criteria with weights")  
    weights = models.JSONField(default=list, help_text="Weights for each criterion")  
    rankings = models.JSONField(default=list, help_text="Rankings with calculated scores")  
    timestamp = models.DateTimeField(null=True ,auto_now_add=True) 

    def __str__(self):
        return f"Topsis Result ({self.timestamp})"


class PrometheeResult(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    criteria = models.JSONField(default=list, help_text="Selected criteria with weights")
    weights = models.JSONField(default=list, help_text="Weights for each criterion")
    rankings = models.JSONField(default=list, help_text="Rankings with net flows")

    def __str__(self):
        return f"PROMETHEE Result ({self.timestamp})"


class WSMResult(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    criteria = models.JSONField(default=list, help_text="Selected criteria with weights")
    weights = models.JSONField(default=list, help_text="Weights for each criterion")
    rankings = models.JSONField(default=list, help_text="Rankings with calculated scores")

    def __str__(self):
        return f"WSM Result ({self.timestamp})"


class Criteria(models.Model):
    name = models.CharField(max_length=255, unique=True)
    field = models.CharField(max_length=255, unique=True)
    default_weight = models.FloatField()

    def __str__(self):
        return f"{self.name} - {self.default_weight} - {self.field}"