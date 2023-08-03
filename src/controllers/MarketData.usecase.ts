import { MarketData, News } from '../models';
import { AppDataSource } from '../configuration';

async function saveMarketHistoricalData(
  newMarketHisData: MarketData[],
): Promise<void> {
  console.log('saveMarketHistoricalData');
  console.log(newMarketHisData);
  try {
    for (const data of newMarketHisData) {
      await AppDataSource.manager.save(data);
    }
  } catch (error) {
    throw error;
  }
}
export { saveMarketHistoricalData };
