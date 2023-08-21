import { AppDataSource } from '../configuration';
import { Company } from '../models';

interface TagInfoModel {
  tag_id: string;
  tag_cn: string;
  tag_en: string;
}

interface CompanyInfoModel {
  company_name: string;
  company_symbol: string;
  company_information: string;
  industry_position: string;
  tags: TagInfoModel[];
}

interface CompanyInfoListModel {
  companies: CompanyInfoModel[];
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
    const companiesInfo = await Promise.all(
      companyList.map(async (companySymbol) => {
        const company = await AppDataSource.manager.findOne(Company, {
          where: { company_symbol: companySymbol },
          relations: ['tags'],
        });

        if (!company) {
          throw new Error(`Company with symbol ${companySymbol} not found`);
        }

        return {
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
      }),
    );

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

async function getAllCompanySymbols(): Promise<string[]> {
  try {
    const companies = await AppDataSource.manager.find(Company);
    const companySymbols = companies.map((company) => company.company_symbol);
    return companySymbols;
  } catch (error) {
    throw new Error(`Error while fetching company symbols: ${error.message}`);
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

export {
  getCompanyInfoAndTags,
  getListOfCompanyInfoAndTags,
  getAllCompanies,
  getAllCompanySymbols,
  findCompanyBySymbol,
};
