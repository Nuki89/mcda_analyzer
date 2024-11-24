from rest_framework.views import APIView
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.decorators import action
from django.urls import reverse
from rest_framework import status
from .models import *
from .serializers import *
from .services.scraper import scrape_fortune_rows
from .services.scraper_optimized import scrape_fortune_rows_hybrid
from .mcda import *
from django.utils import timezone
from rest_framework import viewsets
import numpy as np
import logging
import requests

logger = logging.getLogger(__name__)

def convert_to_int(value):
    if value in (None, '-', ''):  # Checks for '-', empty, or None values
        return None
    try:
        return int(value.replace(",", ""))
    except (ValueError, TypeError):
        return None

def convert_to_float(value):
    if value in (None, '-', ''):  # Checks for '-', empty, or None values
        return None
    try:
        return float(value.replace(",", "").replace("$", ""))
    except (ValueError, TypeError):
        return None


class ApiRootView(APIView):
    def get(self, request, *args, **kwargs):
        return Response({
            "scrape": request.build_absolute_uri(reverse("trigger-scraping")),
        })

 
class CriteriaWeightsView(ViewSet):
    def list(self, request):
        criteria = list(Criteria.objects.all().values('name', 'field', 'default_weight'))

        if not criteria:
            criteria = [
                {"name": "Revenue", "field": "revenue", "default_weight": 0.3},
                {"name": "Profits", "field": "profits", "default_weight": 0.2},
                {"name": "Assets", "field": "assets", "default_weight": 0.2},
                {"name": "Employees", "field": "employees", "default_weight": 0.1},
                {"name": "Years on List", "field": "years_on_list", "default_weight": 0.1},
                {"name": "Change in Rank", "field": "change_in_rank", "default_weight": 0.1},
            ]
        return Response(criteria)
    

class CriteriaDBView(viewsets.ModelViewSet):
    queryset = Criteria.objects.all()
    serializer_class = CriteriaSerializer

    def list(self, request, *args, **kwargs):
        criteria = list(self.queryset.values('name', 'field', 'default_weight'))
        if not criteria:
            return Response({"error": "No criteria found in the database."}, status=status.HTTP_404_NOT_FOUND)
        return Response(criteria, status=status.HTTP_200_OK)


class ScrapeFortuneDataView(APIView):
    queryset = Fortune500Entry.objects.all()
    serializer_class = Fortune500EntrySerializer

    def get(self, request):
        url = "https://fortune.com/ranking/global500/search/"

        try:
            Fortune500Entry.objects.all().delete()
            
            scraped_data = scrape_fortune_rows_hybrid(url, num_rows=20)

            field_mapping = {
                "Rank": "rank",
                "Name": "name",
                "Revenues ($M)": "revenue",
                "Revenue Percent Change": "revenue_percent_change",
                "Profits ($M)": "profits",
                "Profits Percent Change": "profits_percent_change",
                "Assets ($M)": "assets",
                "Employees": "employees",
                "Change in Rank": "change_in_rank",
                "Years on Global 500 List": "years_on_list",
            }

            entries = []
            for item in scraped_data:
                entry_data = {model_field: item.get(scraped_field) for scraped_field, model_field in field_mapping.items()}
                entry = Fortune500Entry(
                    rank=convert_to_int(entry_data["rank"]),
                    name=entry_data["name"],
                    revenue=convert_to_float(entry_data["revenue"]),
                    revenue_percent_change=entry_data["revenue_percent_change"],
                    profits=convert_to_float(entry_data["profits"]),
                    profits_percent_change=entry_data["profits_percent_change"],
                    assets=convert_to_float(entry_data["assets"]),
                    employees=convert_to_int(entry_data["employees"]),
                    change_in_rank=convert_to_int(entry_data["change_in_rank"]),
                    years_on_list=convert_to_int(entry_data["years_on_list"]),
                    sector=request.query_params.get("sector", "N/A"),
                    industry=request.query_params.get("industry", "N/A"),
                    last_scraped=timezone.now()
                )
                entries.append(entry)

            Fortune500Entry.objects.bulk_create(entries, ignore_conflicts=True)

            saved_entries = Fortune500Entry.objects.order_by('last_scraped')[:len(entries)]

            serializer = Fortune500EntrySerializer(saved_entries, many=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CachedFortuneDataView(viewsets.ModelViewSet):
    queryset = Fortune500Entry.objects.all()
    serializer_class = Fortune500EntrySerializer

    def get(self, request):
        entries = Fortune500Entry.objects.all().order_by('rank')
        serializer = Fortune500EntrySerializer(entries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AHPView(viewsets.ModelViewSet):
    queryset = AHPResult.objects.all()
    serializer_class = AHPResultSerializer

    def get(self, request):
        try:
            # Run the AHP calculation
            company_scores = calculate_ahp()
            return Response(company_scores, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PrometheeView(viewsets.ModelViewSet):
    # queryset = PrometheeResult.objects.all()
    # serializer_class = PrometheeResultSerializer

    def get(self, request):
        return Response({
            "detail": "This endpoint calculates rankings using the PROMETHEE method. Please use POST with data to perform calculations."
        }, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def post(self, request):
        # Placeholder for PROMETHEE calculation logic
        return Response({"message": "PROMETHEE calculation not implemented yet"}, status=status.HTTP_501_NOT_IMPLEMENTED)


class TOPSISView(APIView):
    def get(self, request):
        try:
            criteria_response = requests.get('http://127.0.0.1:8000/criteria-db/')
            if criteria_response.status_code != 200:
                return Response({"error": "Failed to fetch criteria and weights."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            criteria = criteria_response.json()
            
            selected_criteria_param = request.query_params.get('selected_criteria', None)
            if selected_criteria_param:
                selected_criteria = selected_criteria_param.split(',')
                criteria = [c for c in criteria if c['name'] in selected_criteria]

            if not criteria:
                return Response({"error": "No valid criteria selected."}, status=status.HTTP_400_BAD_REQUEST)

            criteria_names = [c['name'] for c in criteria]
            default_weights = np.array([c['default_weight'] for c in criteria])

            entries = Fortune500Entry.objects.order_by('last_scraped')[:20]
            if not entries.exists():
                return Response({"error": "No data found. Please scrape data first."}, status=status.HTTP_404_NOT_FOUND)
            
            company_names = [entry.name for entry in entries]

            data = np.array([
                [
                    getattr(entry, c['field'], 0) or 0 
                    for c in criteria
                ]
                for entry in entries
            ], dtype=float)

            weights_param = request.query_params.get('weights', None)
            if weights_param:
                try:
                    weights = np.array([float(w) for w in weights_param.split(',')])
                    if len(weights) != len(criteria_names):
                        return Response({
                            "error": f"Invalid weights. Expected {len(criteria_names)} weights but got {len(weights)}."
                        }, status=status.HTTP_400_BAD_REQUEST)

                    if not np.isclose(weights.sum(), 1.0):
                        weights = weights / weights.sum()
                except ValueError:
                    return Response({"error": "Weights must be numeric values."}, status=status.HTTP_400_BAD_REQUEST)
            else:
                weights = default_weights

            all_coefficients, highest_coefficient, best_index = calculate_topsis(data, weights, company_names, criteria_names)

            sorted_indices = np.argsort(-all_coefficients)
            sorted_names = [company_names[i] for i in sorted_indices]
            sorted_coefficients = [all_coefficients[i] for i in sorted_indices]
            
            result = {
                "criteria_with_weights": [{"name": name, "weight": weight} for name, weight in zip(criteria_names, weights)],
                "closeness_coefficients": dict(zip(sorted_names, sorted_coefficients)),
            }

            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)