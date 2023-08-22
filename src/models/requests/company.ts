export interface CompanyQuotesModel {
  companies: CompanyInfoModel[];
}

export interface CompanyInfoModel {
  company_id: string;
  company_name: string;
  company_symbol: string;
  company_industry: string;
  company_information: string;
  industry_position: string;
  established_time: Date;
  info_create_time: Date;
  info_update_time: Date;
  earnings_announcement?: Date;
}

// GET /api/companies/company_infos/:companySymbol
export interface GetCompanyInfoResponseModel extends CompanyInfoModel {}

// POST /api/companies/company_infos
export interface GetMultiCompanyInfosReqBodyModel {
  companySymbols: string[];
}

export interface GetMultiCompanyInfosResponseModel
  extends Array<CompanyInfoModel> {}

// GET /api/companies/all
export interface GetAllCompanyInfosResponseModel
  extends Array<CompanyInfoModel> {}

// GET /api/companies/all_symbol
export interface GetAllCompanySymbolsResponseModel extends Array<string> {}

export interface TagModel {
  tag_id: string;
  tag_cn: string;
  tag_en: string;
}

export interface GetAllTagsModel extends Array<TagModel> {}

export interface GetCompaniesWithQuotesByTag
  extends Array<CompanyWithLatestQuoteModel> {}

export interface CompanyWithLatestQuoteModel {
  company_name: string;
  company_symbol: string;
  latestQuote: QuoteModel;
}

export interface QuoteModel {
  market_data_id: string;
  record_time: Date;
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
  volume: string; // Note: This is a string in the provided JSON. If it's supposed to be a number, adjust accordingly.
  avgVolume: string; // Same note as for 'volume'.
  exchange: string;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  earningsAnnouncement: Date;
  sharesOutstanding: string; // Note: This is a string in the provided JSON. If it's supposed to be a number, adjust accordingly.
  company_id: string;
}
