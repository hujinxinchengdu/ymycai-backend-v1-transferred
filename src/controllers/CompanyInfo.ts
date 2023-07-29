import { AppDataSource } from '../configuration';
import { Company } from '../models';

interface TagInfo {
  tag_id: string;
  tag_cn: string;
  tag_en: string;
}

interface CompanyInfo {
  company_name: string;
  company_symbol: string;
  company_information: string;
  industry_position: string;
  tags: TagInfo[];
}

async function getCompanyInfoAndTags(
  companySymbol: string,
): Promise<CompanyInfo> {
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

export { getCompanyInfoAndTags };
