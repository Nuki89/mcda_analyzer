import numpy as np
import math

# Define company data based on your JSON format
# Each row represents a company, and each column a criterion
# Criteria order: Revenue, Profits, Assets, Employees, Years on List, Change in Rank
x = np.array([
    [494890.10, 120699.30, 660819.20, 73311, 6, -2],
    [217829.00, 4280.00, 123869.00, 83426, 14, -3],
    [141731.80, 14559.20, 225842.10, 82560, 18, -14],
    [122383.20, 829.60, 141176.30, 214409, 7, -3],
    [96978.80, 457.10, 136067.60, 128616, 30, -29],
    [74776.70, 1113.70, 100857.70, 140142, 10, -1],
    [71466.10, 5947.60, 85215.30, 36549, 18, -22],
    [63639.80, 993.60, 159091.10, 439051, 12, -50],
    [58574.00, 10957.00, 95924.00, 9900, 29, -86],
    [54041.00, 10058.00, 103549.00, 57174, 19, -10],
    [53817.00, 12921.00, 101296.00, 42319, 30, -88],
    [51525.90, 997.30, 68398.20, 130427, 12, -16],
    [41784.00, 7983.00, 94186.00, 66807, 18, -31],
    [38689.80, 3045.30, 40894.30, 6925, 3, -113],
    [35364.00, 2154.20, 73994.90, 144531, 5, -81],
    [33533.20, 1252.50, 73316.40, 214937, 11, -112],
    [33126.50, 4872.40, 72404.20, 19657, 7, -83]
])

# Weights for each criterion (adjusted to your priorities)
weights = np.array([0.3, 0.2, 0.2, 0.1, 0.1, 0.1])  # example weights

# Step 1: Normalize the matrix
col_sums = np.sqrt((x**2).sum(axis=0))
norm_x = x / col_sums

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
print("Closeness coefficient = ", final_solution)

# Find the highest closeness coefficient
highest_coefficient = final_solution.max()
print("Highest closeness coefficient:", highest_coefficient)