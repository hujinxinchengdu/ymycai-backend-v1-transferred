import { queueRequest } from '../utils';

async function SearchFromExternalAPIService(query: string) {
  try {
    const BASE_URL = process.env.YMYC_FINANCIAL_API_BASE_URL;
    const API_KEY = process.env.YMYC_FINANCIAL_MODELING_KEY;

    const incomeStatementApiUrl = `${BASE_URL}/api/v3/search?query=${query}&limit=10$exchange=NASDAQ&apikey=${API_KEY}`;
    const response = await queueRequest(incomeStatementApiUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching financial report data:', error.message);
    throw error;
  }
}

export { SearchFromExternalAPIService };
