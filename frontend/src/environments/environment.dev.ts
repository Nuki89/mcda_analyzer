// export const environment = {
//   production: false,
//   scrapeUrl: `http://172.179.236.116:8000/scrape/`,
//   apiUrl: 'http://172.179.236.116:8000/scraped-data/',
//   // apiUrl: 'http://127.0.0.1:8000/scraped-data/',
//   apiUrlAHP : 'http://127.0.0.1:8000/ahp-results/',
//   apiUrlPromethee: 'http://127.0.0.1:8000/promethee-results/',
//   apiUrlTopsis: 'http://127.0.0.1:8000/topsis-results/',
//   apiUrlWsm: 'http://127.0.0.1:8000/wsm-results/'
// };

const BASE_URL = `http://172.179.236.116:8000`;

export const environment = {
  production: false,
  scrapeUrl: `${BASE_URL}/scrape/`,
  apiUrl: `${BASE_URL}/scraped-data/`,
  apiUrlAHP: `${BASE_URL}/ahp-results/`,
  apiUrlPromethee: `${BASE_URL}/promethee-results/`,
  apiUrlTopsis: `${BASE_URL}/topsis-results/`,
  apiUrlWsm: `${BASE_URL}/wsm-results/`
};