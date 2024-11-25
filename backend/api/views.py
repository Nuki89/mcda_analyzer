from rest_framework.views import APIView
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.decorators import action
from django.urls import reverse
from rest_framework import status
from .models import *
from .serializers import *
# from .services.scraper import scrape_fortune_rows # Old scraper
from .scrapers.scraper_optimized import scrape_fortune_rows_hybrid
from .services import *
# from .mcda import * # Old mcda 
from django.utils import timezone
from rest_framework import viewsets
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


#SHARED FUNCTIONS ADDED
class AHPView(viewsets.ModelViewSet):
    queryset = AHPResult.objects.all()
    serializer_class = AHPResultSerializer

    def list(self, request, *args, **kwargs):
        try:
            # Fetch and process criteria
            criteria = fetch_criteria('http://127.0.0.1:8000/criteria-db/')
            selected_criteria_param = request.query_params.get('selected_criteria', None)
            criteria, criteria_names, default_weights = process_criteria(criteria, selected_criteria_param)

            # Fetch company data
            entries = Fortune500Entry.objects.order_by('last_scraped')[:20]
            if not entries.exists():
                return Response({"error": "No data found. Please scrape data first."}, status=status.HTTP_404_NOT_FOUND)
            company_names = [entry.name for entry in entries]
            data = np.array([
                [getattr(entry, c['field'], 0) or 0 for c in criteria]
                for entry in entries
            ], dtype=float)

            # Process weights
            weights_param = request.query_params.get('weights', None)
            weights = process_weights(weights_param, default_weights, len(criteria_names))

            # Calculate AHP scores
            scores = calculate_ahp(data, weights, company_names, criteria_names)

            # Prepare response
            result = {
                "criteria_with_weights": [{"name": name, "weight": weight} for name, weight in zip(criteria_names, weights)],
                "ahp_rankings": scores,
            }
            return Response(result, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# SHARED FUNCTIONS ADDED
class TOPSISView(APIView):
    def get(self, request):
        try:
            # Fetch and process criteria
            criteria = fetch_criteria('http://127.0.0.1:8000/criteria-db/')
            selected_criteria_param = request.query_params.get('selected_criteria', None)
            criteria, criteria_names, default_weights = process_criteria(criteria, selected_criteria_param)

            # Fetch company data
            entries = Fortune500Entry.objects.order_by('last_scraped')[:20]
            if not entries.exists():
                return Response({"error": "No data found. Please scrape data first."}, status=status.HTTP_404_NOT_FOUND)
            company_names = [entry.name for entry in entries]
            data = np.array([
                [getattr(entry, c['field'], 0) or 0 for c in criteria]
                for entry in entries
            ], dtype=float)

            # Process weights
            weights_param = request.query_params.get('weights', None)
            weights = process_weights(weights_param, default_weights, len(criteria_names))

            # Calculate TOPSIS scores
            sorted_names, sorted_coefficients = calculate_topsis(data, weights, company_names, criteria_names)

            # Prepare response
            result = {
                "criteria_with_weights": [{"name": name, "weight": weight} for name, weight in zip(criteria_names, weights)],
                "closeness_coefficients": dict(zip(sorted_names, sorted_coefficients)),
            }
            return Response(result, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
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


# WORKS
# class TOPSISView(APIView):
#     def get(self, request):
#         try:
#             criteria_response = requests.get('http://127.0.0.1:8000/criteria-db/')
#             if criteria_response.status_code != 200:
#                 return Response({"error": "Failed to fetch criteria and weights."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
#             criteria = criteria_response.json()
            
#             selected_criteria_param = request.query_params.get('selected_criteria', None)
#             if selected_criteria_param:
#                 selected_criteria = selected_criteria_param.split(',')
#                 criteria = [c for c in criteria if c['name'] in selected_criteria]

#             if not criteria:
#                 return Response({"error": "No valid criteria selected."}, status=status.HTTP_400_BAD_REQUEST)

#             criteria_names = [c['name'] for c in criteria]
#             default_weights = np.array([c['default_weight'] for c in criteria])

#             entries = Fortune500Entry.objects.order_by('last_scraped')[:20]
#             if not entries.exists():
#                 return Response({"error": "No data found. Please scrape data first."}, status=status.HTTP_404_NOT_FOUND)
            
#             company_names = [entry.name for entry in entries]

#             data = np.array([
#                 [
#                     getattr(entry, c['field'], 0) or 0 
#                     for c in criteria
#                 ]
#                 for entry in entries
#             ], dtype=float)

#             weights_param = request.query_params.get('weights', None)
#             if weights_param:
#                 try:
#                     weights = np.array([float(w) for w in weights_param.split(',')])
#                     if len(weights) != len(criteria_names):
#                         return Response({
#                             "error": f"Invalid weights. Expected {len(criteria_names)} weights but got {len(weights)}."
#                         }, status=status.HTTP_400_BAD_REQUEST)

#                     if not np.isclose(weights.sum(), 1.0):
#                         weights = weights / weights.sum()
#                 except ValueError:
#                     return Response({"error": "Weights must be numeric values."}, status=status.HTTP_400_BAD_REQUEST)
#             else:
#                 weights = default_weights

#             all_coefficients, highest_coefficient, best_index = calculate_topsis(data, weights, company_names, criteria_names)

#             sorted_indices = np.argsort(-all_coefficients)
#             sorted_names = [company_names[i] for i in sorted_indices]
#             sorted_coefficients = [all_coefficients[i] for i in sorted_indices]
            
#             result = {
#                 "criteria_with_weights": [{"name": name, "weight": weight} for name, weight in zip(criteria_names, weights)],
#                 "closeness_coefficients": dict(zip(sorted_names, sorted_coefficients)),
#             }

#             return Response(result, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# WORKS
# class AHPView(viewsets.ModelViewSet):
#     queryset = AHPResult.objects.all()
#     serializer_class = AHPResultSerializer

#     def list(self, request, *args, **kwargs):
#         try:
#             # Step 1: Fetch criteria from an external API
#             criteria_response = requests.get('http://127.0.0.1:8000/criteria-db/')
#             if criteria_response.status_code != 200:
#                 return Response({"error": "Failed to fetch criteria and weights."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
#             criteria = criteria_response.json()
#             print("DEBUG: Available criteria fetched from API:", criteria)

#             # Step 2: Handle selected criteria from query parameters
#             selected_criteria_param = request.query_params.get('selected_criteria', None)
#             if selected_criteria_param:
#                 selected_criteria = selected_criteria_param.split(',')
#                 # Case-insensitive filtering
#                 criteria = [c for c in criteria if c['name'].lower() in map(str.lower, selected_criteria)]
#             else:
#                 selected_criteria = [c['name'] for c in criteria]  # Default to all criteria

#             print("DEBUG: Selected criteria from query params:", selected_criteria)
#             print("DEBUG: Filtered criteria after processing:", [c['name'] for c in criteria])

#             # Validate if all selected criteria are present
#             if len(criteria) != len(selected_criteria):
#                 missing_criteria = set(selected_criteria) - set(c['name'] for c in criteria)
#                 return Response({
#                     "error": f"The following criteria were not found: {', '.join(missing_criteria)}"
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             criteria_names = [c['name'] for c in criteria]
#             default_weights = np.array([c['default_weight'] for c in criteria])

#             # Step 3: Handle weights from query parameters
#             weights_param = request.query_params.get('weights', None)
#             if weights_param:
#                 try:
#                     # Parse weights
#                     weights = np.array([float(w) for w in weights_param.split(',')])

#                     # Handle cases where fewer weights are provided
#                     if len(weights) < len(criteria_names):
#                         # Use default weights for missing criteria
#                         weights = np.concatenate((weights, default_weights[len(weights):]))
#                     elif len(weights) > len(criteria_names):
#                         return Response({
#                             "error": f"Too many weights provided. Expected at most {len(criteria_names)} but got {len(weights)}."
#                         }, status=status.HTTP_400_BAD_REQUEST)

#                     # Normalize weights
#                     if not np.isclose(weights.sum(), 1.0):
#                         weights = weights / weights.sum()

#                 except ValueError:
#                     return Response({"error": "Weights must be numeric values."}, status=status.HTTP_400_BAD_REQUEST)
#             else:
#                 weights = default_weights  # Default to all criteria's default weights

#             # Step 4: Fetch company data
#             entries = Fortune500Entry.objects.order_by('last_scraped')[:20]
#             if not entries.exists():
#                 return Response({"error": "No data found. Please scrape data first."}, status=status.HTTP_404_NOT_FOUND)

#             company_names = [entry.name for entry in entries]
#             data = np.array([
#                 [getattr(entry, c['field'], 0) or 0 for c in criteria]
#                 for entry in entries
#             ], dtype=float)

#             # Step 5: Calculate AHP scores
#             scores = calculate_ahp(data, weights, company_names, criteria_names)

#             # Step 6: Prepare results for response
#             scores.sort(key=lambda x: x["score"], reverse=True)
#             result = {
#                 "criteria_with_weights": [{"name": name, "weight": weight} for name, weight in zip(criteria_names, weights)],
#                 "ahp_rankings": scores,
#             }

#             return Response(result, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
