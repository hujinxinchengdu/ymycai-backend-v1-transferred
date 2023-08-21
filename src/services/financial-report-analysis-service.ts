import { FinancialReport, FinancialAnalysis, Company } from '../models';
import { v4 as uuidv4 } from 'uuid';
import { FinancialAnalysisMetrics } from '../models';

function formFinancialReportAnalysis(
  f: FinancialReport,
  company: Company,
  reportType: string,
): FinancialAnalysis {
  const indicators = calculateFinancialIndicators(f);
  const financialAnalysis = new FinancialAnalysis();
  financialAnalysis.fin_analyze_id = uuidv4();
  financialAnalysis.analyses_data = indicators;
  financialAnalysis.company_id = company.company_id;
  financialAnalysis.publish_time = f.publish_time;
  financialAnalysis.type = reportType;

  return financialAnalysis;
}

function calculateFinancialIndicators(
  f: FinancialReport,
): FinancialAnalysisMetrics {
  const netIncome = f.income_statement.netIncome;
  const totalStockholdersEquity = f.balancesheet.totalStockholdersEquity;
  const totalAssets = f.balancesheet.totalAssets;
  const operatingIncome = f.income_statement.operatingIncome;
  const revenue = f.income_statement.revenue;
  const interestIncome = f.income_statement.interestIncome;
  const costOfRevenue = f.income_statement.costOfRevenue;
  const operatingExpenses = f.income_statement.operatingExpenses;
  const totalLiabilities = f.balancesheet.totalLiabilities;

  const eps = f.income_statement.eps;
  const epsdiluted = f.income_statement.epsdiluted;
  //杜邦分析之外的指标
  const retainedEarnings = f.balancesheet.retainedEarnings;
  const freeCashFlow = f.cashflow.freeCashFlow;
  const weightedAverageShsOut = f.income_statement.weightedAverageShsOut;

  return {
    ROE: ROE(netIncome, totalStockholdersEquity),
    ROA: ROA(netIncome, totalAssets),
    equityMutiplier: equityMultiplier(totalAssets, totalStockholdersEquity),
    operatingProfitMargin: operatingProfitMargin(operatingIncome, revenue),
    totalAssetTurnover: totalAssetTurnover(revenue, totalAssets),
    netIncome: netIncome,
    operatingIncome: operatingIncome,
    debtToAssetRatio: debtToAssetRatio(totalLiabilities, totalAssets),
    totalIncome: totalIncome(revenue, interestIncome),
    totalCosts: totalCosts(costOfRevenue, operatingExpenses),
    eps: eps,
    epsdiluted: epsdiluted,
    undistributedEPS: UndistributedEPS(retainedEarnings, weightedAverageShsOut),
    cashFlowPerShare: CashFlowPerShare(freeCashFlow, weightedAverageShsOut),
    netProfitMargin: NetProfitMargin(netIncome, revenue),
  };
}

// 净资产收益率 (Return on Equity, ROE)
function ROE(netIncome: number, totalStockholdersEquity: number): number {
  return netIncome / totalStockholdersEquity;
}

//总资产净利润 (Return on Assets, ROA)
function ROA(netIncome: number, totalAssets: number): number {
  return netIncome / totalAssets;
}

//权益乘数 (Equity Multiplier)
function equityMultiplier(
  totalAssets: number,
  totalStockholdersEquity: number,
): number {
  return totalAssets / totalStockholdersEquity;
}

//营业净利润率 (Operating Profit Margin)
function operatingProfitMargin(
  operatingIncome: number,
  revenue: number,
): number {
  return operatingIncome / revenue;
}

//总资产周转率 (Total Asset Turnover)
function totalAssetTurnover(revenue: number, totalAssets: number): number {
  return revenue / totalAssets;
}

//资产负债率 (Debt to Asset Ratio)
function debtToAssetRatio(
  totalLiabilities: number,
  totalAssets: number,
): number {
  return totalLiabilities / totalAssets;
}

//收入总额 (Total Income)
function totalIncome(revenue: number, interestIncome: number): number {
  return revenue + interestIncome;
}

//成本总额 (Total Costs)
function totalCosts(costOfRevenue: number, operatingExpenses: number): number {
  return costOfRevenue + operatingExpenses;
}

// 每股未分配利润 (Undistributed Earnings per Share)
function UndistributedEPS(
  retainedEarnings: number,
  weightedAverageShsOut: number,
): number {
  return retainedEarnings / weightedAverageShsOut;
}

// 每股经验现金流 (Cash Flow per Share)
function CashFlowPerShare(
  freeCashFlow: number,
  weightedAverageShsOut: number,
): number {
  return freeCashFlow / weightedAverageShsOut;
}

// 净利润率 (Net Profit Margin)
function NetProfitMargin(netIncome: number, revenue: number): number {
  return netIncome / revenue;
}

export { formFinancialReportAnalysis };
