export interface GetCompanyInfosReqParamsModel extends Array<string> {}

export interface GetMultiCompanyInfosReqBodyModel {
  companySymbols: string[];
}

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
