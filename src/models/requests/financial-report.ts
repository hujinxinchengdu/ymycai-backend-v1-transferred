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

export interface FinancialAnalysisMetrics {
  ROE: number;
  ROA: number;
  equityMutiplier: number;
  operatingProfitMargin: number;
  totalAssetTurnover: number;
  netIncome: number;
  operatingIncome: number;
  debtToAssetRatio: number;
  totalIncome: number;
  totalCosts: number;
  eps: number;
  epsdiluted: number;
  undistributedEPS: number;
  cashFlowPerShare: number;
  netProfitMargin: number;
  GrossProfit: number;
  GrossMarginRatio: number;
}

export interface IFinancialAnalysisModel {
  fin_analyze_id: string;
  analyses_data: any; // Replace 'any' with a more specific type if applicable
  company_id: string;
  type: string; // You can make this a union type if it can only be 'Annual' or 'Quarterly'
  publish_time: Date;
  update_time: Date;
}
