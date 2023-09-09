import { InsiderTradingTransaction } from '../models';
import { AppDataSource } from '../configuration';

import { getCompanyNewInsidetrader, getInsidetrader } from '../services';
import { getAllCompanySymbols } from './company-infomation-usecase';

async function saveAllTransaction(): Promise<void> {
  try {
    const transactions = await getInsidetrader();

    const BATCH_SIZE = 500; // 可根据需要调整这个值
    console.log(transactions);
    for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
      const batch = transactions.slice(i, i + BATCH_SIZE);
      await AppDataSource.manager.save(InsiderTradingTransaction, batch);
    }
    return;
  } catch (error) {
    throw error;
  }
}

async function saveAllCompanyTransaction(): Promise<void> {
  try {
    const companySymbols: string[] = await getAllCompanySymbols();
    const batchSize = 10;
    let start = 0;

    while (start < companySymbols.length) {
      const symbolsBatch = companySymbols.slice(start, start + batchSize);
      const transactions = await getCompanyNewInsidetrader(symbolsBatch);
      //开始插入
      const BATCH_SIZE = 500; // 可根据需要调整这个值
      try {
        for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
          const batch = transactions.slice(i, i + BATCH_SIZE);
          await AppDataSource.manager.save(InsiderTradingTransaction, batch);
        }
      } catch (error) {
        console.error('Error inserting insider trade data', error.message);
        throw error;
      }
      start += batchSize;
    }
  } catch (error) {
    console.error('An error occurred', error.message);
    throw error;
  }
}

async function getTransactionBySymbol(
  companySymbol: string,
  page: number,
  pageSize: number,
): Promise<InsiderTradingTransaction[] | null> {
  try {
    const skip = (page - 1) * pageSize; // 计算需要跳过的记录数

    const transactionData = await AppDataSource.manager
      .createQueryBuilder(InsiderTradingTransaction, 'itt')
      .where('itt.symbol = :companySymbol', { companySymbol })
      .orderBy('itt.transactionDate', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getMany();
    return transactionData;
  } catch (error) {
    throw error;
  }
}

export {
  saveAllTransaction,
  getTransactionBySymbol,
  saveAllCompanyTransaction,
};
