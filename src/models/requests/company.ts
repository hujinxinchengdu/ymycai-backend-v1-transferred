export interface GetCompanyInfosReqParamsModel extends Array<string> {}

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
