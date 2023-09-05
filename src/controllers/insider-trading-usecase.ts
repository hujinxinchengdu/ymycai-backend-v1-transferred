import { InsiderTradingTransaction } from '../models';
import { AppDataSource } from '../configuration';

import { getInsiderTrader } from '../services';

async function saveAllTransaction(): Promise<void> {
  try {
    const transactions = await getInsiderTrader();

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

export { saveAllTransaction, getTransactionBySymbol };
