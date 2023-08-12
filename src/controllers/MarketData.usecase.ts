import { MarketData } from '../models';
import { AppDataSource } from '../configuration';
import { getAllCompanies } from './company_infomation';
import { getMarketHistoricalData, getMarketNewData } from '../services';
import { Between, Equal } from 'typeorm';

async function saveMarketHistoricalData(): Promise<void> {
  try {
    const companies = await getAllCompanies();
    for (const company of companies) {
      const existingData = await AppDataSource.manager.findOne(MarketData, {
        where: { company_id: company.company_id },
      });
      if (!existingData) {
        const companySymbol = company.company_symbol;
        const companyMarketData = await getMarketHistoricalData(
          company.company_id,
          companySymbol,
        );
        for (const marketData of companyMarketData) {
          await AppDataSource.manager.save(marketData);
        }
      } else {
        console.log(company.company_symbol + ' already exists in database');
      }
    }
    return;
  } catch (error) {
    throw error;
  }
}

async function saveMarketNewData(): Promise<void> {
  try {
    const companies = await getAllCompanies();
    for (const company of companies) {
      const companySymbol = company.company_symbol;
      const companyMarketData = await getMarketNewData(
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

async function getLastMarketData(
  companyId: string,
): Promise<MarketData | null> {
  try {
    return await AppDataSource.manager
      .createQueryBuilder(MarketData, 'market_data')
      .where('market_data.company_id = :companyId', { companyId })
      .orderBy('market_data.record_time', 'DESC')
      .getOne();
  } catch (error) {
    console.error('Error fetching last market data:', error.message);
    throw error;
  }
}

async function getLatestMarketData(
  companyId: string,
): Promise<MarketData | null> {
  try {
    return await AppDataSource.manager
      .createQueryBuilder(MarketData, 'market_data')
      .where('market_data.company_id = :companyId', { companyId })
      .orderBy('market_data.record_time', 'DESC')
      .getOne();
  } catch (error) {
    console.error('Error fetching last market data:', error.message);
    throw error;
  }
}

async function getDayBeforeLatestMarketData(
  companyId: string,
): Promise<MarketData | null> {
  try {
    const latestMarketData = await AppDataSource.manager
      .createQueryBuilder(MarketData, 'market_data')
      .where('market_data.company_id = :companyId', { companyId })
      .orderBy('market_data.record_time', 'DESC')
      .getOne();

    if (latestMarketData) {
      const latestDate = new Date(latestMarketData.record_time);
      const dayBeforeLatest = new Date(latestDate);
      dayBeforeLatest.setDate(dayBeforeLatest.getDate() - 1);
      dayBeforeLatest.setHours(0, 0, 0, 0);
      const dayBeforeLatestData = await AppDataSource.manager.findOne(
        MarketData,
        {
          where: {
            company_id: companyId,
            record_time: dayBeforeLatest,
          },
        },
      );
      return dayBeforeLatestData as unknown as MarketData;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching last market data:', error.message);
    throw error;
  }
}

export {
  saveMarketHistoricalData,
  getLastMarketData,
  saveMarketNewData,
  getDayBeforeLatestMarketData,
  getLatestMarketData,
};
