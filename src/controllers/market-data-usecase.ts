import { DeepPartial, In, LessThan } from 'typeorm';
import moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../configuration';
import { MarketData, Company, CompanyQuote } from '../models';
import { getCompanyQuoteData, getMarketNewData } from '../services';
import {
  getAllCompanies,
  getAllCompanySymbols,
  getCompaniesByPage,
} from './company-infomation-usecase';
import {
  getCompanyFromId,
  getCompanyFromSymbol,
  getCompanyIdFromSymbol,
} from './util/get-company-by-symbol';
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

async function saveMarketNewDataBySymbol(
  company_symbol: string,
): Promise<void> {
  try {
    console.log(`saveMarketNewDataBySymbol ${company_symbol}`);
    const BATCH_SIZE = 500;

    // 查找公司
    const company = await AppDataSource.manager.findOne(Company, {
      where: { company_symbol: company_symbol },
    });

    if (!company) {
      throw new Error(`Cannot find company!`);
    }

    // 查找最近的已有市场数据
    const latestMarketDataInDb = await getLastMarketDataForServices(
      company.company_id,
    );

    const latestDateInDb = latestMarketDataInDb
      ? latestMarketDataInDb.record_time
      : new Date(0);

    // 获取新的市场数据
    const companyMarketData: MarketData[] = await getMarketNewData(
      company.company_id,
      company.company_symbol,
    );

    const marketDataToSave: MarketData[] = [];

    // 仅保存比数据库中最新数据更新的数据
    for (const data of companyMarketData) {
      if (data.record_time > latestDateInDb) {
        marketDataToSave.push(data);
      } else if (
        data.record_time.getTime() === latestDateInDb.getTime() &&
        data.company_id === company.company_id
      ) {
        // Find the corresponding record in the database
        const existingRecord = await AppDataSource.manager.findOne(MarketData, {
          where: {
            record_time: latestDateInDb,
            company_id: company.company_id,
          },
        });
        if (existingRecord) {
          // Update existing record
          Object.assign(existingRecord, data);
          await AppDataSource.manager.save(MarketData, existingRecord);
        }
      } else {
        break;
      }
    }

    // 批量保存数据
    for (let i = 0; i < marketDataToSave.length; i += BATCH_SIZE) {
      const batch = marketDataToSave.slice(i, i + BATCH_SIZE);
      await AppDataSource.manager.save(MarketData, batch);
    }
  } catch (error) {
    throw error;
  }
}

async function saveAllMarketNewData(): Promise<void> {
  try {
    const companies: Company[] = await getAllCompanies();

    const BATCH_SIZE = 500; // 可根据需要调整这个值

    for (const company of companies) {
      await saveMarketNewDataBySymbol(company.company_symbol);
    }
  } catch (error) {
    throw error;
  }
}

type Identifier = { symbol: string } | { companyId: string };

import { subDays } from 'date-fns'; // date-fns库用于日期操作

async function getMarketDataByIdentifier(
  identifier: Identifier,
  limit: number = 1000,
  offset: number = 0,
): Promise<MarketData[]> {
  try {
    let company: Company | null = null;
    let companyId: string | null = null;

    if ('symbol' in identifier) {
      company = await getCompanyFromSymbol(identifier.symbol); // 获取company_id
      if (!company) {
        throw Error(`getMarketDataByIdentifier cannot find company`);
      }
      companyId = company.company_id;
    } else {
      company = await getCompanyFromId(identifier.companyId);
      if (!company) {
        throw Error(`getMarketDataByIdentifier cannot find company`);
      }
      companyId = company.company_id;
    }

    // 计算日期范围
    const endDate = new Date(); // 今天
    const startDate = subDays(endDate, limit + offset); // 从今天往前数 (limit + offset) 天
    const effectiveEndDate = subDays(endDate, offset); // 从今天往前数 offset 天，作为实际的结束日期

    let marketData = await AppDataSource.manager
      .createQueryBuilder(MarketData, 'md')
      .distinctOn(['md.record_time'])
      .where('md.company_id = :companyId', { companyId })
      .andWhere('md.record_time BETWEEN :startDate AND :effectiveEndDate', {
        startDate,
        effectiveEndDate,
      })
      .orderBy('md.record_time', 'ASC')
      .getMany();

    if (marketData.length > 0) {
      return marketData;
    }

    await saveMarketNewDataBySymbol(company.company_symbol); // Assuming this function now returns the saved data

    // 如果没有数据，则获取新的数据
    marketData = await AppDataSource.manager
      .createQueryBuilder(MarketData, 'md')
      .distinctOn(['md.record_time'])
      .where('md.company_id = :companyId', { companyId })
      .andWhere('md.record_time BETWEEN :startDate AND :effectiveEndDate', {
        startDate,
        effectiveEndDate,
      })
      .orderBy('md.record_time', 'ASC')
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
    const chunkSize = 500;
    const batchSize = 100;
    let buffer: any[] = [];
    let totalSaved = 0; // 添加计数器变量
    console.log(companySymbols.length);

    for (let i = 0; i < companySymbols.length; i += batchSize) {
      const batch = companySymbols.slice(i, i + batchSize);
      const data = await getCompanyQuoteData(batch);
      buffer.push(...data);

      if (buffer.length >= chunkSize) {
        await saveBufferToDatabase(buffer);
        totalSaved += buffer.length; // 更新计数器
        buffer = [];
      }
    }

    if (buffer.length > 0) {
      await saveBufferToDatabase(buffer);
      totalSaved += buffer.length; // 更新计数器
    }

    console.log('Company Quote data save operation finished');
    console.log(`Total number of records saved: ${totalSaved}`); // 打印总数
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
    const companies = await getAllCompanySymbols();
    await saveCompanyQuoteDataByCompanySymbolList(companies);
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
  console.log(symbols.length);

  try {
    const query = `
      SELECT * FROM (
          SELECT 
              *,
              ROW_NUMBER() OVER (PARTITION BY symbol ORDER BY record_time DESC) AS rn
          FROM company_quote
          WHERE symbol = ANY($1)
      ) AS tmp
      WHERE rn = 1;
    `;

    const result = await AppDataSource.manager.query(query, [symbols]);

    // 将结果转换为CompanyQuote数组
    const companyQuotes = result as CompanyQuote[];

    // 提取返回结果中的公司符号
    const returnedSymbols = companyQuotes.map((q) => q.symbol);

    // 找出缺失的公司符号
    const missingSymbols = symbols.filter((s) => !returnedSymbols.includes(s));

    if (missingSymbols.length > 0) {
      console.log('以下公司的数据没有被取到：', missingSymbols);
    }

    // 对缺失的公司数据进行处理
    for (const missingSymbol of missingSymbols) {
      const tempMarketData = new CompanyQuote();
      tempMarketData.market_data_id = uuidv4();
      tempMarketData.symbol = missingSymbol;
      tempMarketData.name = 'Unknown';
      tempMarketData.price = 0;
      tempMarketData.changesPercentage = 0;
      tempMarketData.change = 0;
      tempMarketData.dayLow = 0;
      tempMarketData.dayHigh = 0;
      tempMarketData.yearHigh = 0;
      tempMarketData.yearLow = 0;
      tempMarketData.marketCap = 0;
      tempMarketData.priceAvg50 = 0;
      tempMarketData.priceAvg200 = 0;
      tempMarketData.volume = 0;
      tempMarketData.avgVolume = 0;
      tempMarketData.exchange = 'Unknown';
      tempMarketData.open = 0;
      tempMarketData.previousClose = 0;
      tempMarketData.eps = 0;
      tempMarketData.pe = 0;
      tempMarketData.earningsAnnouncement = new Date(0);
      tempMarketData.sharesOutstanding = 0;
      tempMarketData.record_time = new Date();

      companyQuotes.push(tempMarketData);
    }
    console.log(companyQuotes.length);

    return companyQuotes;
  } catch (error) {
    console.error('Error fetching latest company quotes:', error);
    throw error;
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

async function getLastMarketDataForServices(
  companyId: string,
): Promise<MarketData | null> {
  try {
    return await AppDataSource.manager.findOne(MarketData, {
      where: { company_id: companyId },
      order: { record_time: 'DESC' }, // 假设有一个名为'date'的字段来存储数据的日期
    });
  } catch (error) {
    console.error('Error fetching last market data:', error.message);
    throw error;
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

export {
  getLastMarketDataForServices,
  saveAllMarketNewData,
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
