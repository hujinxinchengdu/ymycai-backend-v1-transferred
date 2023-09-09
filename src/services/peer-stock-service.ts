import { PeerStock } from '../models';
import { v4 as uuidv4 } from 'uuid';
import { queueRequest } from '../utils';

export async function getPeerStockData(
  companySymbol: string,
): Promise<PeerStock> {
  try {
    const BASE_URL = process.env.FINANCIAL_API_BASE_URL;
    const API_KEY = process.env.FINANCIAL_MODELING_KEY;

    const peerStockApiUrl = `${BASE_URL}/api/v4/stock_peers?symbol=${companySymbol}&apikey=${API_KEY}`;

    const response = await queueRequest(peerStockApiUrl);

    const peerStockData = response.data[0].peersList;

    // Create a new PeerStock instance and fill it with the data
    const peerStock = new PeerStock();
    peerStock.id = uuidv4();
    peerStock.company_symbol = companySymbol;
    peerStock.peer_symbols = peerStockData;
    peerStock.info_create_time = new Date();
    peerStock.info_update_time = new Date();

    return peerStock;
  } catch (error) {
    console.error('Error fetching peer stock data:', error.message);
    throw error;
  }
}
