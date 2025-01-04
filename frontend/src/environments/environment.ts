// const BASE_URL = `http://172.179.236.116:8000`;
const BASE_URL = `http://0.0.0.0:8000`;

export const apiEndpoints = {
  production: false,
  apiUrlDefaultCriteria: `${BASE_URL}/default-criteria/`,
  scrapeUrl: `${BASE_URL}/scrape/`,
  apiUrl: `${BASE_URL}/scraped-data/`,
  apiUrlAHP: `${BASE_URL}/ahp-results/`,
  apiUrlAHPcalculation: `${BASE_URL}/ahp/`,
  apiUrlTopsis: `${BASE_URL}/topsis-results/`,
  apiUrlTopsisCalculation: `${BASE_URL}/topsis/`,
  apiUrlPromethee: `${BASE_URL}/promethee-results/`,
  apiUrlPrometheeCalculation: `${BASE_URL}/promethee/`,
  apiUrlWsm: `${BASE_URL}/wsm-results/`,
  apiUrlWsmCalculation: `${BASE_URL}/wsm/`,
};