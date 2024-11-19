# import numpy as np
# from ..models import Fortune500Entry, AHPResult

# def calculate_ahp():
#     # Clear any existing AHP results to avoid duplicates
#     AHPResult.objects.all().delete()

#     # Retrieve data from the database
#     companies = Fortune500Entry.objects.all()

#     # Extract criteria data for AHP and convert to floats
#     revenue = np.array([float(company.revenue) for company in companies if company.revenue is not None])
#     profit = np.array([float(company.profits) for company in companies if company.profits is not None])
#     employees = np.array([float(company.employees) for company in companies if company.employees is not None])

#     # Pairwise comparison matrix for criteria
#     pairwise_matrix = np.array([
#         [1, 3, 0.5],
#         [1/3, 1, 0.25],
#         [2, 4, 1]
#     ])
#     column_sums = pairwise_matrix.sum(axis=0)
#     normalized_matrix = pairwise_matrix / column_sums
#     weights = normalized_matrix.mean(axis=1)

#     # Normalize criteria
#     revenue_normalized = revenue / revenue.sum()
#     profit_normalized = profit / profit.sum()
#     employees_normalized = employees / employees.sum()

#     # Calculate scores
#     scores = (weights[0] * revenue_normalized +
#               weights[1] * profit_normalized +
#               weights[2] * employees_normalized)

#     # Save results to AHPResult model
#     for company, score in zip(companies, scores):
#         AHPResult.objects.create(name=company.name, score=score)

#     # Prepare and return the response
#     company_scores = [{"name": company.name, "score": score} for company, score in zip(companies, scores)]
#     company_scores.sort(key=lambda x: x["score"], reverse=True)

#     return company_scores


### TESTS ###
import numpy as np
from ..models import Fortune500Entry, AHPResult

def calculate_ahp():
    # Clear any existing AHP results to avoid duplicates
    AHPResult.objects.all().delete()

    # Retrieve data from the database
    companies = Fortune500Entry.objects.all()

    # Extract criteria data for AHP and convert to floats
    revenue = np.array([float(company.revenue) for company in companies if company.revenue is not None])
    profit = np.array([float(company.profits) for company in companies if company.profits is not None])
    employees = np.array([float(company.employees) for company in companies if company.employees is not None])

    # Pairwise comparison matrix for criteria
    pairwise_matrix = np.array([
        [1, 3, 0.5],
        [1/3, 1, 0.25],
        [2, 4, 1]
    ])
    
    # Consistency Check
    # Calculate eigenvector and largest eigenvalue for consistency ratio
    eigvals, eigvecs = np.linalg.eig(pairwise_matrix)
    max_eigenvalue = np.max(eigvals.real)
    consistency_index = (max_eigenvalue - len(pairwise_matrix)) / (len(pairwise_matrix) - 1)
    
    # Random Consistency Index (RI) values for different matrix sizes
    RI_dict = {1: 0, 2: 0, 3: 0.58, 4: 0.9, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49}
    random_index = RI_dict[len(pairwise_matrix)]
    consistency_ratio = consistency_index / random_index

    # Check if the consistency ratio is acceptable (< 0.1)
    if consistency_ratio > 0.1:
        raise ValueError("The pairwise comparison matrix is inconsistent. Adjust the values.")

    # Normalize the pairwise comparison matrix to calculate weights
    column_sums = pairwise_matrix.sum(axis=0)
    normalized_matrix = pairwise_matrix / column_sums
    weights = normalized_matrix.mean(axis=1)

    # Normalize criteria values
    revenue_normalized = revenue / revenue.sum()
    profit_normalized = profit / profit.sum()
    employees_normalized = employees / employees.sum()

    # Calculate AHP scores for each company
    scores = (weights[0] * revenue_normalized +
              weights[1] * profit_normalized +
              weights[2] * employees_normalized)

    # Save the AHP scores to the AHPResult model
    for company, score in zip(companies, scores):
        AHPResult.objects.create(name=company.name, score=score)

    # Prepare and return the results sorted by score in descending order
    company_scores = [{"name": company.name, "score": score} for company, score in zip(companies, scores)]
    company_scores.sort(key=lambda x: x["score"], reverse=True)

    return company_scores
