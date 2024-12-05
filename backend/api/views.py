from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import viewsets
from rest_framework import status
from django.urls import reverse
from django.utils import timezone
from .models import *
from django.utils.timezone import now
from .serializers import *
# from .services.scraper import scrape_fortune_rows # Old scraper
from .scrapers.scraper_optimized import scrape_fortune_rows_hybrid
from .services import *
# from .mcda import * # Old mcda 
import numpy as np
import logging
import requests


logger = logging.getLogger(__name__)


class ApiRootView(APIView):
    def get(self, request, *args, **kwargs):
        return Response({
            "scrape": request.build_absolute_uri(reverse("trigger-scraping")),
        })

 
class CriteriaWeightsView(ViewSet):
    def list(self, request):
        criteria = list(Criteria.objects.all().values('name', 'field', 'default_weight'))

        if not criteria:
            criteria = get_criteria_with_fallback()
        return Response(criteria)
    

class CriteriaDBView(viewsets.ModelViewSet):
    queryset = Criteria.objects.all()
    serializer_class = CriteriaSerializer

    def list(self, request, *args, **kwargs):
        criteria = get_criteria_with_fallback()
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


class AHPView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            criteria = fetch_criteria('http://127.0.0.1:8000/criteria-db/')
            selected_criteria_param = request.query_params.get('selected_criteria', None)
            criteria, criteria_names, default_weights = process_criteria(criteria, selected_criteria_param)

            entries = Fortune500Entry.objects.order_by('last_scraped')[:20]
            if not entries.exists():
                return Response({"error": "No data found. Please scrape data first."}, status=status.HTTP_404_NOT_FOUND)

            company_names = [entry.name for entry in entries]

            data_matrix = np.array([
                [getattr(entry, c['field'], 0) or 0 for c in criteria]
                for entry in entries
            ], dtype=float)
            weights = default_weights
            scores = calculate_ahp(data_matrix, weights, company_names, criteria_names)

            result = {
                "criteria_with_weights": [{"name": name, "weight": weight} for name, weight in zip(criteria_names, weights)],
                "ahp_rankings": scores,
            }
            
            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            selected_criteria = data.get('selected_criteria', [])
            weights = data.get('weights', [])

            if not selected_criteria or not weights:
                return Response({"error": "Selected criteria and weights are required."}, status=status.HTTP_400_BAD_REQUEST)

            criteria = fetch_criteria('http://127.0.0.1:8000/criteria-db/')
            criteria, criteria_names, default_weights = process_criteria(criteria, ','.join(selected_criteria))

            entries = Fortune500Entry.objects.order_by('last_scraped')[:20]
            if not entries.exists():
                return Response({"error": "No data found. Please scrape data first."}, status=status.HTTP_404_NOT_FOUND)

            company_names = [entry.name for entry in entries]
            data_matrix = np.array([
                [getattr(entry, c['field'], 0) or 0 for c in criteria]
                for entry in entries
            ], dtype=float)

            if len(weights) != len(criteria_names):
                return Response({"error": "The number of weights does not match the number of criteria."}, status=status.HTTP_400_BAD_REQUEST)

            weights = list(map(float, weights))
            scores = calculate_ahp(data_matrix, weights, company_names, criteria_names)

            result = {
                "criteria_with_weights": [{"name": name, "weight": weight} for name, weight in zip(criteria_names, weights)],
                "ahp_rankings": scores,
            }
            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# NOT WORKING...yet
class AHPResultViewSet(viewsets.ModelViewSet):
    queryset = AHPResult.objects.all()
    serializer_class = AHPResultSerializer


class TOPSISView(APIView):
    def get(self, request):
        try:
            criteria = fetch_criteria('http://127.0.0.1:8000/criteria-db/')
            selected_criteria_param = request.query_params.get('selected_criteria', None)
            criteria, criteria_names, default_weights = process_criteria(criteria, selected_criteria_param)

            entries = Fortune500Entry.objects.order_by('last_scraped')[:20]
            if not entries.exists():
                return Response({"error": "No data found. Please scrape data first."}, status=status.HTTP_404_NOT_FOUND)
            company_names = [entry.name for entry in entries]
            data = np.array([
                [getattr(entry, c['field'], 0) or 0 for c in criteria]
                for entry in entries
            ], dtype=float)

            weights_param = request.query_params.get('weights', None)
            weights = process_weights(weights_param, default_weights, len(criteria_names))

            sorted_names, sorted_coefficients = calculate_topsis(data, weights, company_names, criteria_names)

            result = {
                "criteria_with_weights": [{"name": name, "weight": weight} for name, weight in zip(criteria_names, weights)],
                "closeness_coefficients": dict(zip(sorted_names, sorted_coefficients)),
            }
            return Response(result, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PrometheeResultViewSet(viewsets.ModelViewSet):
    queryset = PrometheeResult.objects.all()
    serializer_class = PrometheeResultSerializer

    def get(self, request):
        entries = PrometheeResult.objects.all().order_by('rank')
        serializer = PrometheeResultSerializer(entries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PrometheeView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            criteria_url = 'http://127.0.0.1:8000/criteria-db/'
            selected_criteria_param = request.query_params.get('selected_criteria', None)
            weights_param = request.query_params.get('weights', None)
            
            company_queryset = Fortune500Entry.objects.order_by('last_scraped')[:20]

            result = perform_promethee_calculation(
                criteria_url, selected_criteria_param, weights_param, company_queryset
            )

            self.save_promethee_result(result)

            return Response(result, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, *args, **kwargs):
        try:
            data = request.data

            selected_criteria = data.get('selected_criteria', [])
            weights = data.get('weights', [])
            if not selected_criteria or not weights:
                return Response({"error": "Selected criteria and weights are required."}, status=status.HTTP_400_BAD_REQUEST)

            if len(weights) != len(selected_criteria):
                return Response({"error": "The number of weights does not match the number of criteria."}, status=status.HTTP_400_BAD_REQUEST)

            weights = list(map(float, weights))
            if not np.isclose(sum(weights), 1.0):
                return Response({"error": "Weights must sum to 1."}, status=status.HTTP_400_BAD_REQUEST)

            criteria_url = 'http://127.0.0.1:8000/criteria-db/'
            company_queryset = Fortune500Entry.objects.order_by('last_scraped')[:20]

            # Perform PROMETHEE calculation
            result = perform_promethee_calculation(
                criteria_url, ','.join(selected_criteria), weights, company_queryset
            )

            # Save the result
            self.save_promethee_result(result)

            return Response(result, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def save_promethee_result(self, result):

        PrometheeResult.objects.all().delete()

        criteria_with_weights = result['criteria_with_weights']
        rankings = result['promethee_rankings']

        weights = [item['weight'] for item in criteria_with_weights]

        PrometheeResult.objects.create(
            criteria=criteria_with_weights,
            weights=weights,
            rankings=rankings,
            timestamp=now() 
        )
