import axios from 'axios';
import { getFormattedDate } from '../utils';
import { MarketData } from '../models';
import { getLastMarketDataForServices } from '../controllers';
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
        '?apikey=' +
        API_KEY,
    );
    const tempdate = response.data;
    if (!tempdate['historical']) {
      return [];
    }

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

export async function getMarketNewData(
  companyId: string,
  companySymbol: string,
): Promise<MarketData[]> {
  try {
    const lastMarketData = await getLastMarketDataForServices(companyId);
    const lastDateTimestamp = lastMarketData
      ? lastMarketData.record_time
      : null;
    let lastDate;
    if (lastDateTimestamp !== null) {
      const nextDayDate = new Date(lastDateTimestamp);
      nextDayDate.setDate(nextDayDate.getDate() + 1);
      lastDate = getFormattedDate(nextDayDate);
    } else {
      lastDate = getFormattedDate(new Date());
    }

    const current_date = getFormattedDate(new Date());
    const response = await axios.get<any>(
      'https://financialmodelingprep.com/api/v3/historical-price-full/' +
        companySymbol +
        '?from=' +
        lastDate +
        '&to=' +
        current_date +
        '&apikey=' +
        API_KEY,
    );
    const tempdate = response.data;
    if (!tempdate['historical']) {
      return [];
    }
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
