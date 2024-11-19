import numpy as np

def calculate_topsis(data, weights, company_names, criteria_names):
    # Step 1: Normalize the matrix
    col_sums = np.sqrt((data ** 2).sum(axis=0))
    norm_x = data / col_sums

    # Step 2: Multiply by the weights
    wnx = norm_x * weights

    # Step 3: Determine positive and negative ideal solutions
    pis = np.amax(wnx, axis=0)  # positive ideal solution
    nis = np.amin(wnx, axis=0)  # negative ideal solution

    # Step 4a: Calculate the distance to the positive ideal solution
    dpis = np.sqrt(((wnx - pis) ** 2).sum(axis=1))

    # Step 4b: Calculate the distance to the negative ideal solution
    dnis = np.sqrt(((wnx - nis) ** 2).sum(axis=1))

    # Step 5: Calculate the relative closeness to the ideal solution
    final_solution = dnis / (dpis + dnis)

    # Find the highest closeness coefficient and its index
    highest_coefficient = final_solution.max()
    best_index = final_solution.argmax()
    
    # Print all closeness coefficients with company names and criteria names for clarity
    print("Criteria names:", criteria_names)
    print("\nCloseness coefficients for each company:")
    for idx, score in enumerate(final_solution):
        print(f"{company_names[idx]}: {score:.4f}")

    print(f"\nBest company based on TOPSIS: {company_names[best_index]} with a closeness coefficient of {highest_coefficient:.4f}")
    
    return final_solution, highest_coefficient, best_index


############################################## TEST ##############################################
# import numpy as np

# def calculate_topsis(matrix, weights, company_names, criteria_names):
#     # Normalize the matrix and apply weights
#     col_sums = np.sqrt((matrix ** 2).sum(axis=0))
#     norm_matrix = matrix / col_sums
#     weighted_matrix = norm_matrix * weights

#     # Calculate positive (PIS) and negative (NIS) ideal solutions
#     pis = np.max(weighted_matrix, axis=0)
#     nis = np.min(weighted_matrix, axis=0)

#     # Distance calculations
#     d_pos = np.sqrt(((weighted_matrix - pis) ** 2).sum(axis=1))
#     d_neg = np.sqrt(((weighted_matrix - nis) ** 2).sum(axis=1))
    
#     # Closeness coefficient
#     closeness = d_neg / (d_pos + d_neg)
#     highest_coefficient = closeness.max()
#     best_index = closeness.argmax()

#     # Print all closeness coefficients with company names and criteria names for clarity
#     print("Criteria names:", criteria_names)
#     print("\nCloseness coefficients for each company:")
#     for idx, score in enumerate(closeness):
#         print(f"{company_names[idx]}: {score:.4f}")

#     print(f"\nBest company based on TOPSIS: {company_names[best_index]} with a closeness coefficient of {highest_coefficient:.4f}")

#     return closeness, highest_coefficient, best_index
