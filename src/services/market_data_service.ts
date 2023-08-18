import axios from 'axios';
import { getFormattedDate } from '../utils';
import { MarketData, CompanyQuote } from '../models';
import { getLastMarketDataForServices } from '../controllers';
import { v4 as uuidv4 } from 'uuid';

const API_KEY = process.env.FINANCIAL_MODELING_KEY;
//定义获取市场数据的函数
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
    let fromDate;

    if (lastMarketData) {
      const nextDayDate = new Date(lastMarketData.record_time);
      nextDayDate.setDate(nextDayDate.getDate() + 1);
      fromDate = getFormattedDate(nextDayDate);
    } else {
      fromDate = '1200-01-01'; // 或其他远古日期，作为默认起始日期
    }

    const current_date = getFormattedDate(new Date());

    const response = await axios.get<any>(
      'https://financialmodelingprep.com/api/v3/historical-price-full/' +
        companySymbol +
        '?from=' +
        fromDate +
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
      tempMarketData.unadjustedVolume = data['unadjustedVolume'];
      tempMarketData.change = data['change'];
      tempMarketData.changePercent = data['changePercent'];
      tempMarketData.vwap = data['vwap'];
      tempMarketData.label = data['label'];
      tempMarketData.changeOverTime = data['changeOverTime'];
      tempMarketData.dividend_amount = 0.0;
      tempMarketData.split_coefficient = 0.0;
      tempMarketData.type = 'n/a';
      tempMarketData.last_refreshed = new Date();
      tempMarketData.company_id = companyId;
      MarketDataList.push(tempMarketData);
    }
    console.log(MarketDataList.length);

    return MarketDataList;
  } catch (error) {
    // 处理错误
    console.error('Error fetching market data:', error.message);
    throw error;
  }
}

export async function getCompanyQuoteData(
  companySymbols: string[],
): Promise<CompanyQuote[]> {
  const BASE_URL = process.env.FINANCIAL_API_BASE_URL;
  const API_KEY = process.env.FINANCIAL_MODELING_KEY;

  const symbolsString = companySymbols.join(',');

  const companyQuoteEntries: CompanyQuote[] = [];

  try {
    const companyQuoteDataApiUrl = `${BASE_URL}/api/v3/quote/${symbolsString}?apikey=${API_KEY}`;

    const companyQuoteData = await axios.get<any>(companyQuoteDataApiUrl);
    const quoteRawData = companyQuoteData.data;

    console.log(quoteRawData);

    for (const quoteItem of quoteRawData) {
      const tempMarketData = new CompanyQuote();

      tempMarketData.market_data_id = uuidv4();
      tempMarketData.symbol = quoteItem.symbol;
      tempMarketData.name = quoteItem.name;
      tempMarketData.price = quoteItem.price;
      tempMarketData.changesPercentage = quoteItem.changesPercentage;
      tempMarketData.change = quoteItem.change;
      tempMarketData.dayLow = quoteItem.dayLow;
      tempMarketData.dayHigh = quoteItem.dayHigh;
      tempMarketData.yearHigh = quoteItem.yearHigh;
      tempMarketData.yearLow = quoteItem.yearLow;
      tempMarketData.marketCap = quoteItem.marketCap;
      tempMarketData.priceAvg50 = quoteItem.priceAvg50;
      tempMarketData.priceAvg200 = quoteItem.priceAvg200;
      tempMarketData.volume = quoteItem.volume;
      tempMarketData.avgVolume = quoteItem.avgVolume;
      tempMarketData.exchange = quoteItem.exchange;
      tempMarketData.open = quoteItem.open;
      tempMarketData.previousClose = quoteItem.previousClose;
      tempMarketData.eps = quoteItem.eps;
      tempMarketData.pe = quoteItem.pe;
      tempMarketData.earningsAnnouncement = new Date(
        quoteItem.earningsAnnouncement,
      );
      tempMarketData.sharesOutstanding = quoteItem.sharesOutstanding;
      // Assuming the current date/time is when the data was fetched
      tempMarketData.record_time = new Date();

      companyQuoteEntries.push(tempMarketData);
    }
  } catch (error) {
    console.error(
      `Error fetching market data for symbols: ${symbolsString}:`,
      error.message,
    );
  }

  return companyQuoteEntries;
}
