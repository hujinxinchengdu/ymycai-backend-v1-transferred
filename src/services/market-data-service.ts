import { getFormattedDate } from '../utils';
import { MarketData, CompanyQuote } from '../models';
import { getLastMarketDataForServices } from '../controllers';
import { v4 as uuidv4 } from 'uuid';
import { queueRequest } from '../utils';

const API_KEY = process.env.FINANCIAL_MODELING_KEY;
const BASE_URL = process.env.FINANCIAL_API_BASE_URL;
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
      const current_date = new Date();
      //由于如果from大于现在的日期将无效, 所以我们有这个判断
      if (nextDayDate >= current_date) {
        const MarketDataList: MarketData[] = [];
        return MarketDataList;
      }
      fromDate = getFormattedDate(nextDayDate);
    } else {
      fromDate = '1200-01-01'; // 或其他远古日期，作为默认起始日期
    }

    const marketDataApiUrl = `${BASE_URL}/api/v3/historical-price-full/${companySymbol}?apikey=${API_KEY}&from=${fromDate}`;

    const response = await queueRequest(marketDataApiUrl);

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
      tempMarketData.vwap = data['vwap'] ?? 0;
      tempMarketData.label = data['label'];
      tempMarketData.changeOverTime = data['changeOverTime'];
      tempMarketData.dividend_amount = 0.0;
      tempMarketData.split_coefficient = 0.0;
      tempMarketData.type = 'company';
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

export async function getCompanyQuoteData(
  companySymbols: string[],
): Promise<CompanyQuote[]> {
  const symbolsString = companySymbols.join(',');

  const companyQuoteEntries: CompanyQuote[] = [];

  try {
    const companyQuoteDataApiUrl = `${BASE_URL}/api/v3/quote/${symbolsString}?apikey=${API_KEY}`;

    const companyQuoteData = await queueRequest(companyQuoteDataApiUrl);
    const quoteRawData = companyQuoteData.data;

    for (const quoteItem of quoteRawData) {
      const tempMarketData = new CompanyQuote();

      tempMarketData.market_data_id = uuidv4();
      tempMarketData.symbol = quoteItem.symbol;
      tempMarketData.name = quoteItem.name;
      tempMarketData.price = quoteItem.price || 0;
      tempMarketData.changesPercentage = quoteItem.changesPercentage || 0;
      tempMarketData.change = quoteItem.change || 0;
      tempMarketData.dayLow = quoteItem.dayLow || 0;
      tempMarketData.dayHigh = quoteItem.dayHigh || 0;
      tempMarketData.yearHigh = quoteItem.yearHigh || 0;
      tempMarketData.yearLow = quoteItem.yearLow || 0;
      tempMarketData.marketCap = quoteItem.marketCap || 0;
      tempMarketData.priceAvg50 = quoteItem.priceAvg50 || 0;
      tempMarketData.priceAvg200 = quoteItem.priceAvg200 || 0;
      tempMarketData.volume = quoteItem.volume || 0;
      tempMarketData.avgVolume = quoteItem.avgVolume || 0;
      tempMarketData.exchange = quoteItem.exchange || 0;
      tempMarketData.open = quoteItem.open || 0;
      tempMarketData.previousClose = quoteItem.previousClose || 0;
      tempMarketData.eps = quoteItem.eps || 0;
      tempMarketData.pe = quoteItem.pe || 0;
      tempMarketData.earningsAnnouncement = new Date(
        quoteItem.earningsAnnouncement,
      );
      tempMarketData.sharesOutstanding = quoteItem.sharesOutstanding || 0;
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
