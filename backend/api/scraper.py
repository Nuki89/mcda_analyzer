from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException, ElementClickInterceptedException
import time
import json

def scrape_fortune_rows(url, num_rows=20):
    options = Options()
    options.add_experimental_option("detach", True)
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(service=ChromeService(
        ChromeDriverManager().install()), options=options)
    driver.get(url)

    try:
        # Dismiss cookie or policy banner if it appears
        try:
            print("Trying to dismiss the cookie consent banner...")
            consent_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.ID, "onetrust-accept-btn-handler"))
            )
            consent_button.click()
            print("Cookie consent banner dismissed.")
        except (NoSuchElementException, TimeoutException):
            print("Cookie consent banner not found or already dismissed.")

        # Open the industry dropdown menu
        print("Opening the industry dropdown...")
        industry_dropdown_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button[data-cy='industry-ddl-button']"))
        )
        driver.execute_script("arguments[0].click();", industry_dropdown_button)
        time.sleep(1)  # Wait briefly for dropdown to expand

        # Select "Mining, Crude-Oil Production" from the dropdown
        print("Selecting 'Mining, Crude-Oil Production' option...")
        mining_option = WebDriverWait(driver, 10).until(
            # EC.element_to_be_clickable((By.XPATH, "//li[contains(@role, 'option') and contains(., 'Mining, Crude-Oil Production')]"))
            EC.element_to_be_clickable((By.XPATH, "//li[contains(@role, 'option') and contains(., 'Mining, Crude-Oil Production')]"))
        )
        driver.execute_script("arguments[0].click();", mining_option)
        print("'Mining, Crude-Oil Production' option selected.")
        
        # Retry loop for clicking the dropdown and selecting "20 Rows"
        for attempt in range(3):
            try:
                print(f"Attempt {attempt + 1}: Selecting '20 Rows' option...")
                
                # Click the dropdown button for rows
                dropdown_button = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, "button[data-cy='filter-rows-to-show-button']"))
                )
                driver.execute_script("arguments[0].click();", dropdown_button)

                time.sleep(1)

                twenty_rows_option = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH, "//li[@role='option' and contains(., '20 Rows')]"))
                )
                driver.execute_script("arguments[0].click();", twenty_rows_option)
                print("'20 Rows' option selected.")
                break  # Exit the loop if successful

            except ElementClickInterceptedException:
                print(f"Attempt {attempt + 1} failed: Element was intercepted, retrying...")
                time.sleep(2)
            except TimeoutException:
                print(f"Attempt {attempt + 1} failed: Timeout occurred, retrying...")
                time.sleep(2)

        # Wait for the rows to load with 20 rows displayed
        print("Waiting for rows to load...")
        WebDriverWait(driver, 20).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, "tr[data-cy='list-row']"))
        )

        # Locate all rows in the table (first 20 rows should be loaded after selecting "20 Rows")
        rows = driver.find_elements(By.CSS_SELECTOR, "tr[data-cy='list-row']")
        print(f"Rows loaded: {len(rows)}")

        # Extract column titles for reference
        column_titles = driver.find_elements(By.CLASS_NAME, "column-title")
        headers = [column.text for column in column_titles]
        print("Column Headers:", headers)

        # Loop through each row and extract data from each cell
        all_data = []
        for row_idx, row in enumerate(rows[:num_rows], start=1):
            cells = row.find_elements(By.CSS_SELECTOR, "td[data-cy='list-cell']")
            row_data = [cell.text for cell in cells]  
            
            # Create a dictionary for each row using headers as keys
            row_dict = dict(zip(headers, row_data))
            all_data.append(row_dict)

        # Convert data to JSON format and print it
        json_data = json.dumps(all_data, indent=4)
        print("Data in JSON format:")
        print(json_data)

        # Optionally, save to a JSON file
        # with open("fortune_500_data.json", "w") as json_file:
        #     json_file.write(json_data)
        #     print("Data saved to 'fortune_500_data.json'")

        return all_data

    except (NoSuchElementException, TimeoutException, ElementClickInterceptedException) as e:
        print(f"Error occurred: {e}")
    finally:
        driver.quit()

# Call the function with the URL and number of rows to scrape
# scrape_fortune_rows("https://fortune.com/ranking/global500/search/", num_rows=20)
# scrape_fortune_rows()
