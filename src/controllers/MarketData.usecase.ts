import { MarketData } from '../models';
import { AppDataSource } from '../configuration';
import { getAllCompanies } from './company_infomation';
import { getMarketHistoricalData } from '../services';

async function saveMarketHistoricalData(): Promise<void> {
  try {
    const companies = await getAllCompanies();
    for (const company of companies) {
      const companySymbol = company.company_symbol;
      const companyMarketData = await getMarketHistoricalData(
        company.company_id,
        companySymbol,
      );
      for (const marketData of companyMarketData) {
        await AppDataSource.manager.save(marketData);
      }
    }
    return;
  } catch (error) {
    throw error;
  }
}
export { saveMarketHistoricalData };
