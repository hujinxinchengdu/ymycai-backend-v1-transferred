import { Company, InsiderTradingTransaction, MarketData } from '../models';
import { queueRequest } from '../utils';
import {
  findCompanyBySymbol,
  getAllCompanySymbols,
  getTransactionBySymbol,
} from '../controllers';
import { v4 as uuidv4 } from 'uuid';

const API_KEY = process.env.YMYC_FINANCIAL_MODELING_KEY;
const BASE_URL = process.env.YMYC_FINANCIAL_API_BASE_URL;

export async function getInsideTrader(): Promise<InsiderTradingTransaction[]> {
  //通过第三方api获取内幕交易
  const insideTraderApiUrl = `${BASE_URL}/api/v4/insider-trading?transactionType=P-Purchase,S-Sale&page=0&apikey=${API_KEY}`;

  try {
    //获取目前数据库里所有的公司symbol
    const companySymbol: string[] = await getAllCompanySymbols();
    const response = await queueRequest(insideTraderApiUrl);
    const tempdate = response.data;
    if (!tempdate) {
      return [];
    }
    const insiderTraderList: InsiderTradingTransaction[] = [];
    for (const data of tempdate) {
      //如果数据库里有这个公司的symbol，就把这个公司的内幕交易信息存到数据库里
      if (companySymbol.includes(data['symbol'])) {
        const tempInsiderTradingTransaction = new InsiderTradingTransaction();
        tempInsiderTradingTransaction.transaction_id = uuidv4();
        tempInsiderTradingTransaction.symbol = data['symbol'];
        tempInsiderTradingTransaction.reportingCik = data['reportingCik'];
        tempInsiderTradingTransaction.filingDate = data['filingDate'];
        tempInsiderTradingTransaction.transactionDate = data['transactionDate'];
        tempInsiderTradingTransaction.transactionType = data['transactionType'];
        tempInsiderTradingTransaction.securitiesOwned = data['securitiesOwned'];
        tempInsiderTradingTransaction.companyCik = data['companyCik'];
        tempInsiderTradingTransaction.reportingName = data['reportingName'];
        tempInsiderTradingTransaction.typeOfOwner = data['typeOfOwner'];
        tempInsiderTradingTransaction.acquistionOrDisposition =
          data['acquistionOrDisposition'];
        tempInsiderTradingTransaction.formType = data['formType'];
        tempInsiderTradingTransaction.securitiesTransacted =
          data['securitiesTransacted'];
        tempInsiderTradingTransaction.price = data['price'];
        tempInsiderTradingTransaction.securityName = data['securityName'];
        tempInsiderTradingTransaction.link = data['link'];
        insiderTraderList.push(tempInsiderTradingTransaction);
      }
    }
    return insiderTraderList;
  } catch (error) {
    console.error(`Error get insider trade data`, error.message);
    throw error;
  }
}

export async function getCompanyNewInsidetrader(
  symbols: string[],
): Promise<InsiderTradingTransaction[]> {
  //通过第三方api获取内幕交易
  const insiderTraderList: InsiderTradingTransaction[] = [];
  try {
    for (const symbol of symbols) {
      const insideTraderApiUrl = `${BASE_URL}/api/v4/insider-trading?symbol=${symbol}&page=0&apikey=${API_KEY}`;
      const response = await queueRequest(insideTraderApiUrl);
      const tempdate = response.data;
      if (tempdate) {
        for (const data of tempdate) {
          const tempInsiderTradingTransaction = new InsiderTradingTransaction();
          tempInsiderTradingTransaction.transaction_id = uuidv4();
          tempInsiderTradingTransaction.symbol = data['symbol'] || 'n/a';
          tempInsiderTradingTransaction.reportingCik =
            data['reportingCik'] || 'n/a';
          tempInsiderTradingTransaction.filingDate =
            data['filingDate'] || new Date();
          tempInsiderTradingTransaction.transactionDate =
            data['transactionDate'] || new Date();
          tempInsiderTradingTransaction.transactionType =
            data['transactionType'] || 'n/a';
          tempInsiderTradingTransaction.securitiesOwned =
            data['securitiesOwned'] || -1;
          tempInsiderTradingTransaction.companyCik =
            data['companyCik'] || 'n/a';
          tempInsiderTradingTransaction.reportingName =
            data['reportingName'] || 'n/a';
          tempInsiderTradingTransaction.typeOfOwner =
            data['typeOfOwner'] || 'n/a';
          tempInsiderTradingTransaction.acquistionOrDisposition =
            data['acquistionOrDisposition'] || 'n/a';
          tempInsiderTradingTransaction.formType = data['formType'] || 'n/a';
          tempInsiderTradingTransaction.securitiesTransacted =
            data['securitiesTransacted'] || -1;
          tempInsiderTradingTransaction.price = data['price'] || -1;
          tempInsiderTradingTransaction.securityName =
            data['securityName'] || 'n/a';
          tempInsiderTradingTransaction.link = data['link'] || 'n/a';
          insiderTraderList.push(tempInsiderTradingTransaction);
        }
      }
    }
    return insiderTraderList;
  } catch (error) {
    console.error(`Error get insider trade data`, error.message);
    throw error;
  }
}
