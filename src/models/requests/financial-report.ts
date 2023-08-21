import { FinancialReport } from '..';

// POST /api/financial_reports/:companySymbol
export interface PostFinancialReportReqBodyModel {
  isQuarterly: boolean;
}

export interface PostFinancialReportResponseModel {
  message: string;
}

// PUT /api/financial_reports/:companySymbol
export interface PutFinancialReportReqBodyModel {
  isQuarterly: boolean;
}

export interface PutFinancialReportResponseModel {
  message: string;
}

// GET /api/financial_reports/:companySymbol
export interface GetFinancialReportReqParamsModel {
  companySymbol: string;
  isQuarterly: boolean;
  from: Date;
  to: Date;
}

export interface GetFinancialReportResponseModel extends FinancialReport {}
