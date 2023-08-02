import { MarketData, News } from '../models';
import { AppDataSource } from '../configuration';

async function saveMarketData(
  newMarketData: Partial<MarketData>,
): Promise<MarketData> {
  const tempMarketData = new MarketData();

  try {
    const saveMarketData = await AppDataSource.manager.save(tempMarketData);
    return saveMarketData;
  } catch (error) {
    throw new Error(`Error while saving news: ${error.message}`);
  }
}
