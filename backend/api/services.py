import logging
from .models import *

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