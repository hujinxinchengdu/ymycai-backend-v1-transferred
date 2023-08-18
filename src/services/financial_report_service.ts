import axios from 'axios';
import { FinancialReport } from '../models';
import { v4 as uuidv4 } from 'uuid';
import { queueRequest } from '../utils';

export async function getFinancialReportData(
  companySymbol: string,
  isQuarterly: boolean,
  companyId: string,
): Promise<FinancialReport[]> {
  try {
    const BASE_URL = process.env.FINANCIAL_API_BASE_URL;
    const API_KEY = process.env.FINANCIAL_MODELING_KEY;
    //获取损益表
    const incomeStatementApiUrl = isQuarterly
      ? `${BASE_URL}/api/v3/income-statement/${companySymbol}?period=quarter&limit=400&apikey=${API_KEY}`
      : `${BASE_URL}/api/v3/income-statement/${companySymbol}?limit=120&apikey=${API_KEY}`;
    //获取资产负债表
    const balanceSheetApiUrl = isQuarterly
      ? `${BASE_URL}/api/v3/balance-sheet-statement/${companySymbol}?period=quarter&limit=400&apikey=${API_KEY}`
      : `${BASE_URL}/api/v3/balance-sheet-statement/${companySymbol}?limit=120&apikey=${API_KEY}`;
    //获取现金流量表数据
    const cashFlowStatmentApiUrl = isQuarterly
      ? `${BASE_URL}/api/v3/cash-flow-statement/${companySymbol}?period=quarter&limit=400&apikey=${API_KEY}`
      : `${BASE_URL}/api/v3/cash-flow-statement/${companySymbol}?limit=120&apikey=${API_KEY}`;

    // const responseIncomeStatement = await axios.get<any>(incomeStatementApiUrl);
    // const responseBalanceSheet = await axios.get<any>(balanceSheetApiUrl);
    // const responseCashFlowStatement = await axios.get<any>(
    //   cashFlowStatmentApiUrl,
    // );
    const responseIncomeStatement = await queueRequest(incomeStatementApiUrl);
    const responseBalanceSheet = await queueRequest(balanceSheetApiUrl);
    const responseCashFlowStatement = await queueRequest(
      cashFlowStatmentApiUrl,
    );

    const IncomeStatementData = responseIncomeStatement.data;
    const balanceSheetData = responseBalanceSheet.data;
    const cashFlowStatementData = responseCashFlowStatement.data;

    const financialReports: FinancialReport[] = [];

    for (const balanceSheetItem of balanceSheetData) {
      const date = balanceSheetItem.date;
      const matchedIncomeStatementItem = IncomeStatementData.find(
        (item: any) => item.date === date,
      );
      const matchedCashFlowStatementItem = cashFlowStatementData.find(
        (item: any) => item.date === date,
      );

      // Check if we found matching dates in other datasets
      if (matchedIncomeStatementItem && matchedCashFlowStatementItem) {
        const tempFinancialReport = new FinancialReport();
        tempFinancialReport.fin_report_id = uuidv4();
        tempFinancialReport.type = isQuarterly ? 'Quarterly' : 'Annual';
        tempFinancialReport.publish_time = new Date(date);
        tempFinancialReport.balancesheet = balanceSheetItem;
        tempFinancialReport.income_statement = matchedIncomeStatementItem;
        tempFinancialReport.cashflow = matchedCashFlowStatementItem;
        tempFinancialReport.company_id = companyId;
        financialReports.push(tempFinancialReport);
      } else {
        // Handle cases where a match was not found, e.g., log it or fill with placeholder values
      }
    }

    return financialReports;
  } catch (error) {
    console.log(error);
    console.error('Error fetching financial report data:', error.message);
    throw error;
  }
}
