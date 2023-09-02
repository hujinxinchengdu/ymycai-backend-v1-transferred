import { DeepPartial, In, LessThan } from 'typeorm';
import moment from 'moment-timezone';
import { AppDataSource } from '../configuration';
import { MarketData, Company, CompanyQuote } from '../models';
import { getCompanyQuoteData, getMarketNewData } from '../services';
import {
  getAllCompanies,
  getCompaniesByPage,
} from './company-infomation-usecase';
import { getCompanyIdFromSymbol } from './util/get-companyid-by-symbol';
import { chunkPromises } from '../utils';
import { finished } from 'stream';
import { start } from 'repl';

const CONCURRENCY_LIMIT = 5; // Adjust based on how many promises you want to process at once

// // 生成器，用于按需产生获取市场数据的 Promise
// function* marketDataPromiseFactoriesGenerator(companies: Company[]) {
//   for (const company of companies) {
//     yield () => getMarketNewData(company.company_id, company.company_symbol);
//   }
// }

async function saveMarketNewDataBySymbol(company_id: string): Promise<void> {
  try {
    const BATCH_SIZE = 500;
    const company = await AppDataSource.manager.findOne(Company, {
      where: { company_id: company_id },
    });

    if (!company) {
      throw new Error(`Cannot find company!`);
    }
    const companyMarketData: MarketData[] = await getMarketNewData(
      company.company_id,
      company.company_symbol,
    );

    // 对于每家公司，将其市场数据分批保存
    for (let i = 0; i < companyMarketData.length; i += BATCH_SIZE) {
      const batch = companyMarketData.slice(i, i + BATCH_SIZE);
      await AppDataSource.manager.save(MarketData, batch);
    }
  } catch (error) {
    throw error;
  }
}

async function saveMarketNewData(): Promise<void> {
  try {
    const companies: Company[] = await getAllCompanies();

    const BATCH_SIZE = 500; // 可根据需要调整这个值

    for (const company of companies) {
      const companySymbol = company.company_symbol;
      const companyMarketData: MarketData[] = await getMarketNewData(
        company.company_id,
        companySymbol,
      );

      // 对于每家公司，将其市场数据分批保存
      for (let i = 0; i < companyMarketData.length; i += BATCH_SIZE) {
        const batch = companyMarketData.slice(i, i + BATCH_SIZE);
        await AppDataSource.manager.save(MarketData, batch);
      }
    }
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

type Identifier = { symbol: string } | { companyId: string };

async function getMarketDataByIdentifier(
  identifier: Identifier,
): Promise<MarketData[]> {
  try {
    let companyId: string | null = null;

    if ('symbol' in identifier) {
      companyId = await getCompanyIdFromSymbol(identifier.symbol); // 获取company_id
    } else {
      companyId = identifier.companyId;
    }

    await saveMarketNewDataBySymbol(companyId!);

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

// async function saveCompanyQuoteDataByCompanySymbolList(
//   companySymbols: string[],
// ): Promise<void> {
//   try {
//     // const companyQuoteDatas = await getCompanyQuoteData(companySymbols);

//     // Convert companySymbols into an array of functions returning promises
//     const promiseFunctions = companySymbols.map(
//       (symbol) => async () => await getCompanyQuoteData([symbol]),
//     );

//     // Fetch company quote data in chunks
//     const allCompanyQuoteDatas = await chunkPromises(
//       promiseFunctions,
//       CONCURRENCY_LIMIT,
//     );

//     const companyQuoteDatas = allCompanyQuoteDatas.flat();

//     const chunkSize = 500;
//     for (let i = 0; i < companyQuoteDatas.length; i += chunkSize) {
//       const currentChunk = companyQuoteDatas.slice(i, i + chunkSize);

//       // 获取当前块的所有公司股票符号
//       const currentChunkSymbols = currentChunk.map((data) => data.symbol);

//       // 为这些符号一次性查找所有公司
//       const companies = await AppDataSource.manager.find(Company, {
//         where: { company_symbol: In(currentChunkSymbols) },
//       });

//       // 创建一个映射来快速查找公司
//       const companyMap = new Map(
//         companies.map((company) => [company.company_symbol, company]),
//       );

//       const toBeSaved: DeepPartial<CompanyQuote>[] = []; // This array will store the data to be saved

//       currentChunk.forEach((companyQuoteData) => {
//         const company = companyMap.get(companyQuoteData.symbol);
//         if (!company) {
//           console.error(
//             `Company with symbol ${companyQuoteData.symbol} not found`,
//           );
//         } else {
//           toBeSaved.push({
//             ...companyQuoteData,
//             company_id: company.company_id,
//           });
//         }
//       });

//       // Using TypeORM's save method to batch save or update market data
//       if (toBeSaved.length > 0) {
//         await AppDataSource.manager.save(CompanyQuote, toBeSaved);
//       }
//     }

//     console.log('Company Quote data save operation finished');
//   } catch (error) {
//     throw new Error(
//       `Error while updating Company Quote data: ${error.message}`,
//     );
//   }
// }

async function saveCompanyQuoteDataByCompanySymbolList(
  companySymbols: string[],
): Promise<void> {
  try {
    const chunkSize = 500;
    const batchSize = 100; // 每批获取100家公司的数据
    let buffer: any[] = []; // 用于暂存数据

    // 将companySymbols切割成多个batch
    for (let i = 0; i < companySymbols.length; i += batchSize) {
      const batch = companySymbols.slice(i, i + batchSize);
      const data = await getCompanyQuoteData(batch);
      buffer.push(...data); // 将新获取的数据添加到缓存数组

      // 检查是否达到批量保存的阈值
      if (buffer.length >= chunkSize) {
        await saveBufferToDatabase(buffer); // 保存数据
        buffer = []; // 清空缓存数组
      }
    }

    // 如果缓存数组中仍有数据，进行最后一次保存
    if (buffer.length > 0) {
      await saveBufferToDatabase(buffer);
    }

    console.log('Company Quote data save operation finished');
  } catch (error) {
    throw new Error(
      `Error while updating Company Quote data: ${error.message}`,
    );
  }
}

async function saveBufferToDatabase(data: any[]) {
  // 以下是保存数据的逻辑，与你原有的代码基本相同

  const currentChunkSymbols = data.map((d) => d.symbol);
  const companies = await AppDataSource.manager.find(Company, {
    where: { company_symbol: In(currentChunkSymbols) },
  });

  const companyMap = new Map(
    companies.map((company) => [company.company_symbol, company]),
  );

  const toBeSaved: DeepPartial<CompanyQuote>[] = [];

  data.forEach((companyQuoteData) => {
    const company = companyMap.get(companyQuoteData.symbol);
    if (!company) {
      console.error(`Company with symbol ${companyQuoteData.symbol} not found`);
    } else {
      toBeSaved.push({
        ...companyQuoteData,
        company_id: company.company_id,
      });
    }
  });

  if (toBeSaved.length > 0) {
    await AppDataSource.manager.save(CompanyQuote, toBeSaved);
  }
}

//TODO: 需要优化获取速度
async function updateAllCompanyQuoteData(): Promise<void> {
  // const currentTimeET = moment().tz('America/New_York');

  // Check if current time is between 9:30 am and 2:00 pm
  // if (
  //   currentTimeET.isBetween(
  //     moment().tz('America/New_York').hour(9).minute(30),
  //     moment().tz('America/New_York').hour(14).minute(0),
  //   )
  // ) {
  try {
    const companies = await getAllCompanies();
    const companySymbols = companies.map((company) => company.company_symbol);
    await saveCompanyQuoteDataByCompanySymbolList(companySymbols);
    console.log('Company Quote data updated successfully');
  } catch (error) {
    console.error('Error updating Company Quote data:', error);
  }
  // } else {
  //   console.log('Outside of market hours. Not fetching data.');
  // }
}

async function getCompanyQuoteDataByCompanySymbolList(
  symbols: string[],
): Promise<CompanyQuote[]> {
  try {
    // Fetch the CompanyQuote records based on the provided symbols.
    const companyQuotes = await AppDataSource.manager.find(CompanyQuote, {
      where: { symbol: In(symbols) }, // Use TypeORM's "In" function to match any symbol in the list
      order: { record_time: 'DESC' }, // Order by descending record_time as in your example
    });

    return companyQuotes;
  } catch (error) {
    throw new Error(`Error while fetching company quotes: ${error.message}`);
  }
}

async function getLatestCompanyQuoteDataByCompanySymbolList(
  symbols: string[],
): Promise<CompanyQuote[]> {
  try {
    // 1. 获取所有与提供的符号匹配的CompanyQuote记录
    const companyQuotes = await AppDataSource.manager.find(CompanyQuote, {
      where: { symbol: In(symbols) },
      order: { record_time: 'DESC' },
    });

    // 2. 创建一个Map，用于存储每个符号的最新报价
    const latestQuotesMap = new Map<string, CompanyQuote>();

    // 3. 遍历所有的CompanyQuote记录，保存每个符号的最新报价
    for (const quote of companyQuotes) {
      if (!latestQuotesMap.has(quote.symbol)) {
        latestQuotesMap.set(quote.symbol, quote);
      }
    }

    // 4. 将Map的值转换为数组并返回
    return Array.from(latestQuotesMap.values());
  } catch (error) {
    throw new Error(
      `Error while fetching latest company quotes: ${error.message}`,
    );
  }
}

// 定义一个函数来删除两周前的company quote data
async function deleteOldCompanyQuoteData(): Promise<void> {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  try {
    await AppDataSource.manager.delete(CompanyQuote, {
      record_time: LessThan(twoWeeksAgo),
    });

    console.log('Old Company Quote data has been deleted successfully');
  } catch (error) {
    console.error('Error deleting old Company Quote data:', error);
  }
}

export {
  getLastMarketDataForServices,
  saveMarketNewData,
  getDayBeforeLatestMarketData,
  getLatestMarketData,
  getMarketDataByIdentifier,
  saveCompanyQuoteDataByCompanySymbolList,
  getCompanyQuoteDataByCompanySymbolList,
  deleteOldCompanyQuoteData,
  updateAllCompanyQuoteData,
  getLatestCompanyQuoteDataByCompanySymbolList,
  saveMarketNewDataBySymbol,
};
