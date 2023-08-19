import { AppDataSource } from '../../configuration';
import { Company } from '../../models';

async function getCompanyIdFromSymbol(
  companySymbol: string,
): Promise<string | null> {
  try {
    const company = await AppDataSource.manager.findOne(Company, {
      where: { company_symbol: companySymbol },
    });
    if (company) {
      return company.company_id;
    }
    return null;
  } catch (error) {
    console.error(
      'Error fetching companyId from companySymbol:',
      error.message,
    );
    throw error;
  }
}

export { getCompanyIdFromSymbol };
