from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
import json

def scrape_fortune_rows_hybrid(url, num_rows=20):
    # Set up Selenium options for headless mode
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    # Initialize the Selenium WebDriver
    driver = webdriver.Chrome(service=ChromeService(
        ChromeDriverManager().install()), options=options)
    driver.get(url)

    try:
        # Handle cookie consent if it appears
        try:
            print("Trying to dismiss the cookie consent banner...")
            consent_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.ID, "onetrust-accept-btn-handler"))
            )
            consent_button.click()
            print("Cookie consent banner dismissed.")
        except:
            print("No cookie consent banner found or already dismissed.")

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
            EC.element_to_be_clickable((By.XPATH, "//li[contains(@role, 'option') and contains(., 'Mining, Crude-Oil Production')]"))
        )
        driver.execute_script("arguments[0].click();", mining_option)
        print("'Mining, Crude-Oil Production' option selected.")

        # Open and select the "20 Rows" option from the dropdown
        print("Selecting '20 Rows' option...")
        dropdown_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button[data-cy='filter-rows-to-show-button']"))
        )
        dropdown_button.click()
        
        # Select "20 Rows" option
        twenty_rows_option = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//li[@role='option' and contains(., '20 Rows')]"))
        )
        twenty_rows_option.click()
        print("'20 Rows' option selected.")
        
        # Wait for rows to load
        print("Waiting for rows to load...")
        time.sleep(2)  # Wait briefly to ensure the rows load completely

        # Get the HTML page source and parse with BeautifulSoup
        soup = BeautifulSoup(driver.page_source, 'html.parser')

        # Extract the column headers
        headers = [header.text.strip() for header in soup.select(".column-title")]
        print("Column Headers:", headers)

        # Locate all rows and extract data using BeautifulSoup
        data_rows = soup.select("tr[data-cy='list-row']")
        all_data = []
        
        for row in data_rows[:num_rows]:  
            cells = row.select("td[data-cy='list-cell']")  
            row_data = [cell.text.strip() for cell in cells]    
            row_dict = dict(zip(headers, row_data))
            all_data.append(row_dict)

        # Convert data to JSON format and print it
        json_data = json.dumps(all_data, indent=4)
        print("Data in JSON format:")
        print(json_data)

        # Optionally, save to a JSON file
        # with open("test_fortune_500_data.json", "w") as json_file:
        #     json_file.write(json_data)
        #     print("Data saved to 'test_fortune_500_data.json'")
        
        return all_data

    except Exception as e:
        print(f"An error occurred: {e}")
        return []
    finally:
        driver.quit()

# Example usage
# scraped_data = scrape_fortune_rows_hybrid("https://fortune.com/ranking/global500/search/", num_rows=20)
