import { queueRequest } from '../utils';

const API_KEY = process.env.FINANCIAL_MODELING_KEY;
const BASE_URL = process.env.FINANCIAL_API_BASE_URL;

export async function getSymbolListData(
  symbolQuery: string,
  exchange: string,
): Promise<void> {
  const symbolSearchApiUrl = `${BASE_URL}/api/v3/search-ticker?query=${symbolQuery}&limit=10&exchange=${exchange}&apikey=${API_KEY}`;
  try {
    const response = await queueRequest(symbolSearchApiUrl);
    const data = response.data;
    if (!data) {
      return;
    }
    return data;
  } catch (error) {
    console.error('Error getting ticker list: ', error.message);
    throw error;
  }
}
