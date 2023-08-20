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
  established_time: string;
  info_create_time: string;
  info_update_time: string;
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
