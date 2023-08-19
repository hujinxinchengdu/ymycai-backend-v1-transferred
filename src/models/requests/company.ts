export interface GetCompanyInfosReqParamsModel extends Array<string> {}

export interface MswCompanyQuoteModel {
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
  exchange: string;
  volume: number;
  avgVolume: number;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  earningsAnnouncement: string;
  sharesOutstanding: number;
  timestamp: number;
}

export interface CompanyQuotesModel {
  companies: CompanyInfoModel[];
}

export interface TagInfo {
  tag_id: string;
  tag_cn: string;
  tag_en: string;
}

export interface CompanyInfoModel {
  company_name: string;
  company_symbol: string;
  company_information: string;
  industry_position: string;
  tags: TagInfo[];
}
