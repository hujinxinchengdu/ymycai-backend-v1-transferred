export interface GetCompaniesQuotesReqBodyModel {
  symbolList: string[];
}

export interface CompanyQuoteModel {
  market_data_id: string;
  record_time: string;
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  volume: string;
  avgVolume: string;
  exchange: string;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  earningsAnnouncement: string;
  sharesOutstanding: string;
}

export interface GetCompaniesQuotesResponseModel {
  message: string;
  data: CompanyQuoteModel[];
}

// PUT /api/market_data/company_quote

// PUT /api/market_data/save_new_market_data

// GET /api/market_data/schedule_save_new_market_data

// GET /api/market_data/latest_day_data/:companySymbol
export interface GetLastDayDataByCompanyResponseModel {
  market_data_id: string;
  record_time: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  adj_close: number;
  volume: string; // :TODO 未来可能改成number
  company_id: string;
  dividend_amount: number;
  split_coefficient: number;
  type: string;
  last_refreshed: Date;
}

// GET /api/market_data/day_before_latest_data/:companySymbol

// GET /api/market_data/:symbol

// POST /api/market_data/company_quote
