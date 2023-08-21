import { InsiderTradingTransaction, MarketData } from '../models';
import { AppDataSource } from '../configuration';

import { getInsidetrader } from '../services';

async function saveAllTransaction(): Promise<void> {
  try {
    const transactions = await getInsidetrader();

    const BATCH_SIZE = 500; // 可根据需要调整这个值

    for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
      const batch = transactions.slice(i, i + BATCH_SIZE);
      await AppDataSource.manager.save(InsiderTradingTransaction, batch);
    }
    return;
  } catch (error) {
    throw error;
  }
}

export { saveAllTransaction };
