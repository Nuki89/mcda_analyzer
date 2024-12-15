import logging
from .models import *
import numpy as np
from django.core.exceptions import ValidationError
import requests
from decimal import Decimal

logger = logging.getLogger(__name__)


def get_criteria_with_fallback():
    """
    Fetches criteria from the database. If there is no criteria in the database, falls back to a hardcoded default list.
    """
    criteria = list(Criteria.objects.all().values('name', 'field', 'default_weight'))
    if not criteria:
        logger.warning("No criteria found in the database. Falling back to hardcoded defaults.")
        criteria = [
            {"name": "Revenue", "field": "revenue", "default_weight": 0.3},
            {"name": "Profits", "field": "profits", "default_weight": 0.2},
            {"name": "Assets", "field": "assets", "default_weight": 0.2},
            {"name": "Employees", "field": "employees", "default_weight": 0.1},
            {"name": "Years on List", "field": "years_on_list", "default_weight": 0.1},
            {"name": "Change in Rank", "field": "change_in_rank", "default_weight": 0.1},
        ]

    else:
        logger.info(f"Fetched {len(criteria)} criteria from the database.")
    return criteria


def get_criteria_with_fallback_test():
    """
    Fetches criteria from the database. If there is no criteria in the database, falls back to a hardcoded default list.
    """
    criteria = list(Criteria.objects.all().values('name', 'field', 'default_weight'))
    if not criteria:
        logger.warning("No criteria found in the database. Falling back to hardcoded defaults.")
        fallback_criteria = [
            {"name": "Revenue", "field": "revenue", "default_weight": 0.3},
            {"name": "Profits", "field": "profits", "default_weight": 0.2},
            {"name": "Assets", "field": "assets", "default_weight": 0.2},
            {"name": "Employees", "field": "employees", "default_weight": 0.1},
            {"name": "Years on List", "field": "years_on_list", "default_weight": 0.1},
            {"name": "Change in Rank", "field": "change_in_rank", "default_weight": 0.1},
        ]

        for criterion in fallback_criteria:
            Criteria.objects.create(
                name=criterion['name'],
                field=criterion['field'],
                default_weight=criterion['default_weight']
            )
        
        return fallback_criteria

    else:
        logger.info(f"Fetched {len(criteria)} criteria from the database.")
    return criteria


def convert_to_int(value):
    """
    Converts a value to integer. Removes commas. Returns None if the value is None, empty, or '-'.
    """
    if value in (None, '-', ''):  # Checks for '-', empty, or None values
        return None
    try:
        return int(value.replace(",", ""))
    except (ValueError, TypeError):
        return None


def convert_to_float(value):
    """
    Converts a value to float. Removes commas and dollar signs if the value is a string.
    Handles Decimal objects directly. Returns None for invalid or non-convertible values.
    """
    if value in (None, '-', ''):  # Handle None, '-', and empty strings
        return None
    try:
        if isinstance(value, Decimal): 
            return float(value)
        if isinstance(value, (int, float)):
            return float(value)
        return float(value.replace(",", "").replace("$", ""))
    except (ValueError, TypeError):
        return None


def fetch_criteria(api_url):
    """Fetch criteria from an external API."""
    response = requests.get(api_url)
    if response.status_code != 200:
        raise ValidationError("Failed to fetch criteria from external API.")
    return response.json()


def process_criteria(criteria, selected_criteria_param):
    """Filter and process criteria based on selected criteria."""
    if selected_criteria_param:
        selected_criteria = selected_criteria_param.split(',')
        criteria = [c for c in criteria if c['name'].lower() in map(str.lower, selected_criteria)]
        if not criteria:
            raise ValidationError("No valid criteria selected.")
    else:
        selected_criteria = [c['name'] for c in criteria]  
    return criteria, [c['name'] for c in criteria], np.array([c['default_weight'] for c in criteria])


def process_weights(weights_param, default_weights, num_criteria):
    """Validate and normalize weights."""
    if weights_param:
        weights = np.array([float(w) for w in weights_param.split(',')])
        if len(weights) < num_criteria:
            weights = np.concatenate((weights, default_weights[len(weights):]))
        elif len(weights) > num_criteria:
            raise ValidationError(f"Too many weights provided. Expected {num_criteria} but got {len(weights)}.")
        if not np.isclose(weights.sum(), 1.0):
            weights = weights / weights.sum() 
    else:
        weights = default_weights  
    return weights


def calculate_ahp(data, weights, company_names, criteria_names):
    """
    Calculate AHP scores for companies.

    Args:
        data (numpy.ndarray): Matrix of company data.
        weights (numpy.ndarray): Criteria weights.
        company_names (list): Names of companies.
        criteria_names (list): Names of criteria.

    Returns:
        list: Sorted scores with company names.
    """
    # Normalize data matrix
    normalized_data = data / data.sum(axis=0)
    weighted_data = normalized_data * weights
    scores = weighted_data.sum(axis=1)

    # Prepare sorted results
    company_scores = [{"name": name, "score": score} for name, score in zip(company_names, scores)]
    company_scores.sort(key=lambda x: x["score"], reverse=True)
    return company_scores


def calculate_topsis(data, weights, company_names, criteria_names):
    """
    Calculate TOPSIS scores for companies.

    Args:
        data (numpy.ndarray): Matrix of company data.
        weights (numpy.ndarray): Criteria weights.
        company_names (list): Names of companies.
        criteria_names (list): Names of criteria.

    Returns:
        tuple: Sorted names and closeness coefficients.
    """
    # Normalize data matrix
    normalized_data = data / np.sqrt((data ** 2).sum(axis=0))
    weighted_data = normalized_data * weights

    # Determine positive and negative ideal solutions
    positive_ideal = weighted_data.max(axis=0)
    negative_ideal = weighted_data.min(axis=0)

    # Calculate distances to ideal solutions
    distance_positive = np.sqrt(((weighted_data - positive_ideal) ** 2).sum(axis=1))
    distance_negative = np.sqrt(((weighted_data - negative_ideal) ** 2).sum(axis=1))

    # Calculate closeness coefficients
    closeness_coefficients = distance_negative / (distance_positive + distance_negative)

    # Prepare sorted results
    sorted_indices = np.argsort(-closeness_coefficients)
    sorted_names = [company_names[i] for i in sorted_indices]
    sorted_coefficients = [closeness_coefficients[i] for i in sorted_indices]

    return sorted_names, sorted_coefficients


def perform_topsis_calculation(criteria_url, selected_criteria, weights_param, company_queryset):
    # Step 1: Fetch and process criteria
    criteria = fetch_criteria(criteria_url)  # Fetch default criteria from the provided URL
    criteria, criteria_names, default_weights = process_criteria(criteria, selected_criteria)

    # Step 2: Fetch company data
    if not company_queryset.exists():
        raise ValidationError("No data found. Please scrape data first.")

    company_names = [entry.name for entry in company_queryset]
    data_matrix = np.array([
        [getattr(entry, c['field'], 0) or 0 for c in criteria]
        for entry in company_queryset
    ], dtype=float)

    # Step 3: Process weights
    weights = process_weights(weights_param, default_weights, len(criteria_names))

    # Step 4: Perform TOPSIS calculation
    sorted_names, closeness_coefficients = calculate_topsis(data_matrix, weights, company_names, criteria_names)

    # Debugging: Check what is returned
    print("Sorted Names:", sorted_names)
    print("Closeness Coefficients:", closeness_coefficients)

    # Step 5: Prepare the result
    result = {
        "criteria_with_weights": [{"name": name, "weight": weight} for name, weight in zip(criteria_names, weights)],
        "topsis_rankings": [{"name": name, "closeness_coefficient": coeff}
                            for name, coeff in zip(sorted_names, closeness_coefficients)],
    }

    print("Result:", result)

    return result


def calculate_promethee(data, weights, company_names, criteria_directions, scale_net_flows=False):
    """
    Calculate PROMETHEE rankings for companies with optional scaling.

    Args:
        data (numpy.ndarray): Matrix of company data.
        weights (numpy.ndarray): Criteria weights.
        company_names (list): Names of companies.
        criteria_directions (list): 1 for benefit, -1 for cost.
        scale_net_flows (bool): Whether to scale net flows to a specific range.

    Returns:
        list: Sorted scores with company names.
    """
    num_companies, num_criteria = data.shape

    # Normalize weights
    weights = np.array(weights)
    weights = weights / np.sum(weights)

    # Normalize data
    normalized_data = np.zeros_like(data, dtype=float)
    for j in range(num_criteria):
        range_criteria = data[:, j].max() - data[:, j].min()
        if range_criteria != 0:
            if criteria_directions[j] == 1:  # Benefit criterion
                normalized_data[:, j] = (data[:, j] - data[:, j].min()) / range_criteria
            elif criteria_directions[j] == -1:  # Cost criterion
                normalized_data[:, j] = (data[:, j].max() - data[:, j]) / range_criteria
        else:
            normalized_data[:, j] = 0.5  # Assign mid-point for identical values

    # Calculate pairwise preferences
    preference_matrix = np.zeros((num_companies, num_companies))
    for i in range(num_companies):
        for j in range(num_companies):
            if i != j:
                preference_sum = 0
                for k in range(num_criteria):
                    preference_value = max(0, normalized_data[i, k] - normalized_data[j, k])
                    preference_sum += weights[k] * preference_value
                preference_matrix[i, j] = preference_sum

    # Calculate positive and negative preference flows
    positive_flows = preference_matrix.sum(axis=1)
    negative_flows = preference_matrix.sum(axis=0)
    net_flows = positive_flows - negative_flows

    # Optionally scale net flows
    if scale_net_flows:
        min_flow, max_flow = min(net_flows), max(net_flows)
        net_flows = [(flow - min_flow) / (max_flow - min_flow) for flow in net_flows]

    # Rank companies
    company_scores = [{"name": name, "net_flow": net_flow} for name, net_flow in zip(company_names, net_flows)]
    company_scores.sort(key=lambda x: x["net_flow"], reverse=True)

    return company_scores


def perform_promethee_calculation(criteria_url, selected_criteria, weights_param, company_queryset):
    # Fetch and process criteria
    criteria = fetch_criteria(criteria_url)
    criteria, criteria_names, default_weights = process_criteria(criteria, selected_criteria)

    # Fetch company data
    if not company_queryset.exists():
        raise ValidationError("No data found. Please scrape data first.")

    company_names = [entry.name for entry in company_queryset]
    data_matrix = np.array([
        [getattr(entry, c['field'], 0) or 0 for c in criteria]
        for entry in company_queryset
    ], dtype=float)

    # Process weights and directions
    weights = process_weights(weights_param, default_weights, len(criteria_names))
    criteria_directions = [1 if c.get('field').endswith('_benefit') else -1 for c in criteria]

    # Perform PROMETHEE calculation
    scores = calculate_promethee(data_matrix, weights, company_names, criteria_directions)

    # Prepare the result
    result = {
        "criteria_with_weights": [{"name": name, "weight": weight} for name, weight in zip(criteria_names, weights)],
        "promethee_rankings": scores,
    }
    return result


def calculate_wsm(data, weights, alternative_names, criteria_names):
    """
    Calculate WSM scores for alternatives.

    Args:
        data (numpy.ndarray): Matrix of alternative data.
        weights (numpy.ndarray): Criteria weights.
        alternative_names (list): Names of the alternatives.
        criteria_names (list): Names of criteria.

    Returns:
        list: Sorted scores with alternative names.
    """
    # Normalize weights (if they aren't already normalized to sum to 1)
    normalized_weights = weights / np.sum(weights)
    
    # Calculate weighted sum for each alternative
    weighted_data = data * normalized_weights
    scores = weighted_data.sum(axis=1)

    # Prepare sorted results
    alternative_scores = [{"name": name, "score": score} for name, score in zip(alternative_names, scores)]
    alternative_scores.sort(key=lambda x: x["score"], reverse=True)
    return alternative_scores


def perform_wsm_calculation(criteria_url, selected_criteria_param, weights_param, company_queryset):
    criteria = fetch_criteria(criteria_url)
    criteria, criteria_names, default_weights = process_criteria(criteria, selected_criteria_param)

    if not company_queryset.exists():
        raise ValueError("No data found. Please scrape data first.")
    
    if weights_param:
        weights = np.array(list(map(float, weights_param.split(','))))
        if len(weights) != len(criteria):
            raise ValidationError("The number of weights must match the number of selected criteria.")
    else:
        weights = default_weights  
    alternative_names = [entry.name for entry in company_queryset]

    data_matrix = np.array([
        [getattr(entry, c['field'], 0) or 0 for c in criteria]
        for entry in company_queryset
    ], dtype=float)

    scores = calculate_wsm(data_matrix, weights, alternative_names, criteria_names)

    result = {
        "criteria_with_weights": [{"name": name, "weight": weight} for name, weight in zip(criteria_names, weights)],
        "wsm_rankings": scores,
    }

    return result
