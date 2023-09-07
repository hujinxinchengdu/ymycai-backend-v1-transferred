import { AppDataSource } from '../configuration';
import { getSymbolListData } from '../services';
import { Company, CompanySearchModel } from '../models';

const EXCHANGE_NASDAQ = 'NASDAQ';
const EXCHANGE_NYSE = 'NYSE';

async function getSymbolList(
  companySymbol: string,
): Promise<CompanySearchModel[]> {
  if (typeof companySymbol !== 'string') {
    throw new Error('The companySymbol parameter must be a string.');
  }

  try {
    const rawCompanyListNASDAQ = await getSymbolListData(
      companySymbol,
      EXCHANGE_NASDAQ,
    );
    const rawCompanyListNYSE = await getSymbolListData(
      companySymbol,
      EXCHANGE_NYSE,
    );

    const companyList = Array.from(
      new Set(rawCompanyListNASDAQ.concat(rawCompanyListNYSE)),
    );

    const queryResults = await AppDataSource.manager
      .createQueryBuilder(Company, 'company')
      .select([
        'company.company_name',
        'company.company_symbol',
        'company.company_id',
      ])
      .where('company.company_symbol IN (:...companyList)', {
        companyList: companyList,
      })
      .getMany();

    const existingCompanies: CompanySearchModel[] = queryResults.map(
      (elem: Company) => {
        return {
          company_id: elem.company_id,
          company_name: elem.company_name,
          company_symbol: elem.company_symbol,
        };
      },
    );

    return existingCompanies;
  } catch (error) {
    throw new Error(`Error while getting symbol list: ${error.message}`);
  }
}

export { getSymbolList };
