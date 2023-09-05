import { AppDataSource } from '../configuration';
import { v4 as uuidv4 } from 'uuid';
import { SelectQueryBuilder, In } from 'typeorm';
import {
  Company,
  Tag,
  CompanyQuote,
  PeerStock,
  CompanyInfoModel,
} from '../models';
import { getPeerStockData } from '../services';
import {
  getLatestCompanyQuoteDataByCompanySymbolList,
  saveCompanyQuoteDataByCompanySymbolList,
  getMarketDataByIdentifier,
} from './market-data-usecase';

interface CompanyInfoListModel {
  companies: CompanyInfoModel[];
}

interface CompanyWithLatestQuoteModel {
  company_name: string;
  company_symbol: string;
  latestQuote: CompanyQuote;
}

async function getCompanyInfoAndTags(
  companySymbol: string,
): Promise<CompanyInfoModel> {
  try {
    const company = await AppDataSource.manager.findOne(Company, {
      where: { company_symbol: companySymbol },
      relations: ['tags'],
    });

    if (!company) {
      throw new Error(`Company with symbol ${companySymbol} not found`);
    }

    return {
      company_id: company.company_id,
      company_name: company.company_name,
      company_symbol: company.company_symbol,
      company_information: company.company_information,
      industry_position: company.industry_position,
      tags: company.tags.map((tag) => ({
        tag_id: tag.tag_id,
        tag_cn: tag.tag_cn,
        tag_en: tag.tag_en,
      })),
    };
  } catch (error) {
    throw new Error(`Error while fetching company: ${error.message}`);
  }
}

async function getListOfCompanyInfoAndTags(
  companyList: string[],
): Promise<CompanyInfoListModel> {
  try {
    const companies = await AppDataSource.manager.find(Company, {
      where: { company_symbol: In(companyList) }, // Use In() operator to match multiple values
      relations: ['tags'],
    });

    const companiesInfo = companies.map((company) => ({
      company_id: company.company_id,
      company_name: company.company_name,
      company_symbol: company.company_symbol,
      company_information: company.company_information,
      industry_position: company.industry_position,
      tags: company.tags.map((tag) => ({
        tag_id: tag.tag_id,
        tag_cn: tag.tag_cn,
        tag_en: tag.tag_en,
      })),
    }));

    return { companies: companiesInfo };
  } catch (error) {
    throw new Error(`Error while fetching companies: ${error.message}`);
  }
}

async function getAllCompanies(): Promise<Company[]> {
  try {
    const Companies = await AppDataSource.manager.find(Company);
    return Companies;
  } catch (error) {
    throw new Error(`Error while fetching new: ${error.message}`);
  }
}

async function getCompaniesByPage(
  page: number,
  pageSize: number,
): Promise<Company[]> {
  try {
    const skipAmount = page * pageSize;
    const companies = await AppDataSource.manager.find(Company, {
      skip: skipAmount,
      take: pageSize,
    });
    return companies;
  } catch (error) {
    throw new Error(`Error while fetching companies: ${error.message}`);
  }
}

async function getAllCompanySymbols(
  page: number = 0,
  pageSize: number = 50,
): Promise<string[]> {
  try {
    const companies = await AppDataSource.manager.find(Company, {
      skip: page * pageSize,
      take: pageSize,
    });
    const companySymbols = companies.map((company) => company.company_symbol);
    return companySymbols;
  } catch (error) {
    throw new Error(`Error while fetching company symbols: ${error.message}`);
  }
}

async function getAllTags(): Promise<Tag[]> {
  const tags = await AppDataSource.manager.find(Tag);
  return tags;
}

async function getCompanyQuoteByTag(
  id: string,
): Promise<CompanyWithLatestQuoteModel[]> {
  // Find tag by name
  const tag = await AppDataSource.manager.findOne(Tag, {
    where: { tag_id: id },
  });

  if (!tag) throw new Error('Tag not found!');

  // Find companies associated with the tag using QueryBuilder
  const companies = await AppDataSource.manager
    .createQueryBuilder(Company, 'company')
    .select([
      'company.company_name',
      'company.company_symbol',
      'company.company_id',
    ])
    .where((qb: SelectQueryBuilder<Company>) => {
      const subQuery = qb
        .subQuery()
        .select('company_tag.company_id')
        .from('company_to_tags', 'company_tag')
        .where('company_tag.tag_id = :tagId')
        .getQuery();
      return 'company.company_id IN ' + subQuery;
    })
    .setParameter('tagId', tag.tag_id)
    .getMany();

  const companyIds = companies.map((company) => company.company_id);

  // Fetch the latest quotes for all the companies in one go
  const latestQuotes = await AppDataSource.manager.query(`
    SELECT * FROM company_quote
    WHERE company_id IN (${companyIds.map((id) => `'${id}'`).join(',')})
    ORDER BY record_time DESC
    LIMIT ${companyIds.length}
  `);

  const companyWithLatestQuoteList: CompanyWithLatestQuoteModel[] =
    companies.map((company) => ({
      company_name: company.company_name,
      company_symbol: company.company_symbol,
      latestQuote: latestQuotes.find(
        (quote: CompanyQuote) => quote.company_id === company.company_id,
      ),
    }));

  return companyWithLatestQuoteList;
}

export async function getAllPeerStocks(): Promise<void> {
  try {
    // 获取所有公司
    const allCompanies = await getAllCompanies();

    // 获取数据库管理器
    const manager = AppDataSource.manager;

    // 收集所有需要新的PeerStock数据的公司符号
    const companiesToFetch = allCompanies
      .filter((company) => !company.peerStock) // Assuming the peerStock property indicates existing data
      .map((company) => company.company_symbol);

    // 获取需要新的PeerStock数据的公司的PeerStock数据
    const newPeerStocks = await getPeerStockDataForSymbolsList(
      companiesToFetch,
    );

    // 保存新的PeerStock数据到数据库
    await manager.save(PeerStock, newPeerStocks);
  } catch (error) {
    console.log(error);
    console.error('Error fetching or saving peer stock data:', error.message);
  }
}

async function getPeerStockDataForSymbolsList(
  companySymbols: string[],
): Promise<PeerStock[]> {
  const peerStocks: PeerStock[] = [];

  // Use a batch size to limit the number of symbols fetched at once
  const batchSize = 100; // Adjust as needed
  for (let i = 0; i < companySymbols.length; i += batchSize) {
    const symbolsBatch = companySymbols.slice(i, i + batchSize);
    const batchPeerStocks = await Promise.all(
      symbolsBatch.map(async (symbol) => await getPeerStockData(symbol)),
    );
    peerStocks.push(...batchPeerStocks);
  }

  return peerStocks;
}

export async function getPeerStockByCompanySymbol(
  companySymbol: string,
): Promise<PeerStock | null> {
  try {
    // 获取数据库管理器
    const manager = AppDataSource.manager;

    // 检查该公司是否存在
    const company = await manager.findOne(Company, {
      where: { company_symbol: companySymbol },
    });

    // 如果该公司不存在，则返回null或抛出一个错误
    if (!company) {
      throw new Error('Company not found');
    }

    // 检查该公司是否已有PeerStock数据
    const existingPeerStock = await manager.findOne(PeerStock, {
      where: { company_symbol: companySymbol },
    });

    // 如果该公司已有PeerStock数据，则返回它
    if (existingPeerStock) {
      return existingPeerStock;
    }

    // 如果该公司尚未有PeerStock数据，则获取并保存
    const newPeerStock = await getPeerStockData(companySymbol);

    // 保存新的PeerStock数据到数据库
    await manager.save(PeerStock, newPeerStock);

    return newPeerStock;
  } catch (error) {
    console.log(error);
    console.error('Error fetching or saving peer stock data:', error.message);
    throw error;
  }
}

async function findCompanyBySymbol(symbol: string): Promise<Company | null> {
  try {
    const company = await AppDataSource.manager.findOne(Company, {
      where: { company_symbol: symbol },
    });
    return company as unknown as Company;
  } catch (error) {
    console.error('Error fetching company:', error.message);
    return null;
  }
}

async function createCompany(
  symbol: string,
  company_name: string,
): Promise<Company | null> {
  try {
    const company = new Company();
    company.company_id = uuidv4(); // 生成一个UUID作为公司ID
    company.company_name = company_name;
    company.company_symbol = symbol;
    company.company_industry = 'N/A'; // 设置默认行业
    company.company_information = 'N/A'; // 设置默认信息
    company.industry_position = 'N/A'; // 设置默认行业位置
    company.established_time = new Date(); // 使用当前时间作为成立时间
    company.info_create_time = new Date(); // 使用当前时间作为创建时间
    company.info_update_time = new Date(); // 使用当前时间作为更新时间
    company.earnings_announcement = new Date();

    const savedCompany = await AppDataSource.manager.save(Company, company); // 保存实例

    return savedCompany;
  } catch (error) {
    console.error('Error creating company:', error.message);
    return null;
  }
}

export async function getCompanyAndPeerLatestQuotes(
  companySymbol: string,
): Promise<{
  companyInfo: CompanyInfoModel;
  peerStock: PeerStock | null;
  latestQuotes: CompanyQuote[];
  // marketData: MarketData[];
}> {
  try {
    // 获取目标公司的信息
    const companyInfo = await getCompanyInfoAndTags(companySymbol);

    // 获取Peer公司的信息
    const peerStock = await getPeerStockByCompanySymbol(companySymbol);

    // 创建一个包含目标公司和所有Peer公司的symbol数组
    const allSymbols: string[] = [companySymbol];

    if (peerStock) {
      allSymbols.push(...peerStock.peer_symbols); // 假设peer_symbols是PeerStock类型里的一个属性，包含了Peer公司的symbol列表
    }

    await saveCompanyQuoteDataByCompanySymbolList(allSymbols);

    // 获取所有相关公司的最新报价
    const latestQuotes = await getLatestCompanyQuoteDataByCompanySymbolList(
      allSymbols,
    );

    // //获取公司历史价格
    // const marketData = await getMarketDataByIdentifier({
    //   symbol: companySymbol,
    // });

    console.log(latestQuotes);
    console.log('finish');

    return {
      companyInfo,
      peerStock,
      latestQuotes,
      // marketData,
    };
  } catch (error) {
    console.error(
      `Error fetching company and peer latest quotes: ${error.message}`,
    );
    throw error;
  }
}

export {
  getCompanyInfoAndTags,
  getListOfCompanyInfoAndTags,
  getAllCompanies,
  getAllCompanySymbols,
  getAllTags,
  getCompanyQuoteByTag,
  findCompanyBySymbol,
  createCompany,
  getCompaniesByPage,
};
