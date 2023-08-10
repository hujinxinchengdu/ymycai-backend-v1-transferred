import axios from 'axios';
import { MarketData } from '../models';
import { v4 as uuidv4 } from 'uuid';
const API_KEY = process.env.FINANCIAL_MODELING_KEY;
// 定义获取市场数据的函数
export async function getMarketHistoricalData(
  companyId: string,
  companySymbol: string,
): Promise<MarketData[]> {
  try {
    const response = await axios.get<any>(
      'https://financialmodelingprep.com/api/v3/historical-price-full/' +
        companySymbol +
        '?from=2023-03-08&to=2023-03-12&apikey=' +
        API_KEY,
    );
    const tempdate = response.data;
    const historicalData = tempdate['historical'];
    const MarketDataList: MarketData[] = [];
    for (const data of historicalData) {
      const tempMarketData = new MarketData();
      tempMarketData.market_data_id = uuidv4();
      tempMarketData.record_time = data['date'];
      tempMarketData.open = data['open'];
      tempMarketData.high = data['high'];
      tempMarketData.low = data['low'];
      tempMarketData.close = data['close'];
      tempMarketData.adj_close = data['adjClose'];
      tempMarketData.volume = data['volume'];
      tempMarketData.dividend_amount = 0.0;
      tempMarketData.split_coefficient = 0.0;
      tempMarketData.type = 'n/a';
      tempMarketData.last_refreshed = new Date();
      tempMarketData.company_id = companyId;
      MarketDataList.push(tempMarketData);
    }
    return MarketDataList;
  } catch (error) {
    // 处理错误
    console.error('Error fetching market data:', error.message);
    throw error;
  }
}
