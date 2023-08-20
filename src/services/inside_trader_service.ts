import { InsiderTradingTransaction } from '../models';
import { queueRequest } from '../utils';

const API_KEY = process.env.FINANCIAL_MODELING_KEY;
const BASE_URL = process.env.FINANCIAL_API_BASE_URL;

export async function getInsidetrader(): Promise<InsiderTradingTransaction[]> {
  const insideTraderApiUrl = `${BASE_URL}/api/v4/insider-trading?transactionType=P-Purchase,S-Sale&page=0&apikey=${API_KEY}`;
  const response = await queueRequest(insideTraderApiUrl);
  const tempdate = response.data;
  if (!tempdate) {
    return [];
  }
  for (const data in tempdate) {
    const tempInsiderTradingTransaction = new InsiderTradingTransaction();
    tempInsiderTradingTransaction.symbol = data['id'];
    tempInsiderTradingTransaction.reportingCik = data['ticker'];
    tempInsiderTradingTransaction.filingDate = data['date'];
    tempInsiderTradingTransaction.transactionDate = data['transactionType'];
    tempInsiderTradingTransaction.transactionType = data['ownerType'];
    tempInsiderTradingTransaction.securitiesOwned = data['sharesTraded'];
    tempInsiderTradingTransaction.companyCik = data['lastPrice'];
    tempInsiderTradingTransaction.reportingName = data['sharesHeld'];
    tempInsiderTradingTransaction.typeOfOwner = data['link'];
    tempInsiderTradingTransaction.acquistionOrDisposition = data['filingUrl'];
    tempInsiderTradingTransaction.formType = data['companyName'];
    tempInsiderTradingTransaction.securitiesTransacted = data['companyCik'];
    tempInsiderTradingTransaction.price = data['insiderId'];
    tempInsiderTradingTransaction.securityName = data['insiderName'];
    tempInsiderTradingTransaction.link = data['insiderTitle'];
  }
}
