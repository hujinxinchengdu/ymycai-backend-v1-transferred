import { AppDataSource } from '../configuration';
import { MarketData, Company, CompanyQuote } from '../models';
import {
  getCompanyQuoteData,
  getMarketHistoricalData,
  getMarketNewData,
} from '../services';
import { getAllCompanies } from './company_infomation_usecase';
import { getCompanyIdFromSymbol } from './util/get_companyid_by_symbol';

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

    let allMarketData: MarketData[] = [];

    for (const company of companies) {
      const companySymbol = company.company_symbol;
      const companyMarketData = await getMarketNewData(
        company.company_id,
        companySymbol,
      );
      allMarketData = allMarketData.concat(companyMarketData);
    }

    const BATCH_SIZE = 500; // 可根据需要调整这个值

    for (let i = 0; i < allMarketData.length; i += BATCH_SIZE) {
      const batch = allMarketData.slice(i, i + BATCH_SIZE);
      await AppDataSource.manager.save(MarketData, batch);
    }

    return;
  } catch (error) {
    throw error;
  }
}

async function getLastMarketDataForServices(
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
  companySymbol: string,
): Promise<MarketData | null> {
  try {
    const companyId = await getCompanyIdFromSymbol(companySymbol);
    if (companyId) {
      return await AppDataSource.manager
        .createQueryBuilder(MarketData, 'market_data')
        .where('market_data.company_id = :companyId', { companyId })
        .orderBy('market_data.record_time', 'DESC')
        .getOne();
    }
    return null;
  } catch (error) {
    console.error('Error fetching last market data:', error.message);
    throw error;
  }
}

async function getDayBeforeLatestMarketData(
  companySymbol: string,
): Promise<MarketData | null> {
  try {
    const companyId = await getCompanyIdFromSymbol(companySymbol);
    if (!companyId) return null;

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
    }
    return null;
  } catch (error) {
    console.error('Error fetching last market data:', error.message);
    throw error;
  }
}

async function getMarketDataByCompanySymbol(
  symbol: string,
): Promise<MarketData[]> {
  try {
    const companyId = await getCompanyIdFromSymbol(symbol); // 获取company_id

    // 2. 查询不重复的record_time数据
    const marketData = await AppDataSource.manager
      .createQueryBuilder(MarketData, 'md')
      .distinctOn(['md.record_time'])
      .where('md.company_id = :companyId', { companyId })
      .orderBy('md.record_time', 'DESC')
      .getMany();

    return marketData;
  } catch (error) {
    throw new Error(`Error while fetching market data: ${error.message}`);
  }
}

async function saveCompanyQuoteDataByCompanySymbolList(
  companySymbols: string[],
): Promise<void> {
  try {
    const companyQuoteDatas = await getCompanyQuoteData(companySymbols);

    for (const companyQuoteData of companyQuoteDatas) {
      // 首先，查找与市场数据中的公司股票符号相对应的公司
      const company = await AppDataSource.manager.findOne(Company, {
        where: { company_symbol: companyQuoteData.symbol },
      });

      // 如果找不到公司，则继续下一次迭代
      if (!company) {
        console.error(
          `Company with symbol ${companyQuoteData.symbol} not found`,
        );
        continue;
      }

      // 使用 TypeORM 的 save 方法保存或更新市场数据。
      // 如果市场数据已经存在，则根据主键进行更新。
      // 否则，将插入新记录。
      await AppDataSource.manager.save(companyQuoteData);
    }

    console.log('Company Quote data save operation finished');
  } catch (error) {
    throw new Error(
      `Error while updating Company Quote data: ${error.message}`,
    );
  }
}

export {
  saveMarketHistoricalData,
  getLastMarketDataForServices,
  saveMarketNewData,
  getDayBeforeLatestMarketData,
  getLatestMarketData,
  getMarketDataByCompanySymbol,
  saveCompanyQuoteDataByCompanySymbolList,
};
