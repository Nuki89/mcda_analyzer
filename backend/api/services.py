import logging
from .models import *
import numpy as np
from django.core.exceptions import ValidationError
import requests

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
    Converts a value to float. Removes commas and dollar signs. Returns None if the value is None, empty, or '-'. 
    """
    if value in (None, '-', ''):  # Checks for '-', empty, or None values
        return None
    try:
        return float(value.replace(",", "").replace("$", ""))
    except (ValueError, TypeError):
        return None
    

############################################################################################################
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
            weights = weights / weights.sum()  # Normalize weights
    else:
        weights = default_weights  # Use default weights
    return weights

# AHP-Specific Function
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

# TOPSIS-Specific Function
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
