import { Company, InsiderTradingTransaction, MarketData } from '../models';
import { queueRequest } from '../utils';
import { findCompanyBySymbol } from '../controllers';

const API_KEY = process.env.FINANCIAL_MODELING_KEY;
const BASE_URL = process.env.FINANCIAL_API_BASE_URL;

export async function getInsidetrader(): Promise<InsiderTradingTransaction[]> {
  const insideTraderApiUrl = `${BASE_URL}/api/v4/insider-trading?transactionType=P-Purchase,S-Sale&page=0&apikey=${API_KEY}`;
  try {
    const response = await queueRequest(insideTraderApiUrl);
    console.log(response);
    const tempdate = response.data;
    if (!tempdate) {
      return [];
    }
    const insiderTraderList: InsiderTradingTransaction[] = [];
    // for (const data in tempdate) {
    //   console.log(data)
    //   // const tempInsiderTradingTransaction = new InsiderTradingTransaction();
    //   // tempInsiderTradingTransaction.symbol = data['symbol'];
    //   // tempInsiderTradingTransaction.reportingCik = data['reportingCik'];
    //   // tempInsiderTradingTransaction.filingDate = data['filingDate'];
    //   // tempInsiderTradingTransaction.transactionDate = data['transactionDate'];
    //   // tempInsiderTradingTransaction.transactionType = data['transactionType'];
    //   // tempInsiderTradingTransaction.securitiesOwned = data['securitiesOwned'];
    //   // tempInsiderTradingTransaction.companyCik = data['companyCik'];
    //   // tempInsiderTradingTransaction.reportingName = data['reportingName'];
    //   // tempInsiderTradingTransaction.typeOfOwner = data['typeOfOwner'];
    //   // tempInsiderTradingTransaction.acquistionOrDisposition = data['acquistionOrDisposition'];
    //   // tempInsiderTradingTransaction.formType = data['formType'];
    //   // tempInsiderTradingTransaction.securitiesTransacted = data['securitiesTransacted'];
    //   // tempInsiderTradingTransaction.price = data['price'];
    //   // tempInsiderTradingTransaction.securityName = data['securityName'];
    //   // tempInsiderTradingTransaction.link = data['link'];
    //   // insiderTraderList.push(tempInsiderTradingTransaction);
    // }
    return insiderTraderList;
  } catch (error) {
    console.error(`Error get insider trade data`, error.message);
    throw error;
  }
}
