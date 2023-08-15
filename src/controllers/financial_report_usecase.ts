import { AppDataSource } from '../configuration';
import { getFinancialReportData } from '../services';
import { Company, FinancialReport } from '../models';
import { Between, MoreThan, LessThan } from 'typeorm';

async function saveAllFinancialReportInfoBySymbol(
  companySymbol: string,
  isQuarterly: boolean,
): Promise<void> {
  if (typeof isQuarterly !== 'boolean') {
    throw new Error('The isQuarterly parameter must be a boolean.');
  }

  try {
    const company = await AppDataSource.manager.findOne(Company, {
      where: { company_symbol: companySymbol },
    });

    if (!company) {
      throw new Error(`Company with symbol ${companySymbol} not found`);
    }

    const financialReports = await getFinancialReportData(
      companySymbol,
      isQuarterly,
      company.company_id,
    );

    for (const report of financialReports) {
      const existingReport = await AppDataSource.manager.findOne(
        FinancialReport,
        {
          where: {
            publish_time: report.publish_time,
            company_id: report.company_id,
          },
        },
      );

      console.log('start saving');

      if (!existingReport) {
        await AppDataSource.manager.save(report);
      }
    }
    console.log('finish');
  } catch (error) {
    throw new Error(`Error while fetching company: ${error.message}`);
  }
}

async function updateFinancialReportInfoBySymbol(
  companySymbol: string,
  isQuarterly: boolean,
): Promise<void> {
  if (typeof isQuarterly !== 'boolean') {
    throw new Error('The isQuarterly parameter must be a boolean.');
  }

  const reportType = isQuarterly ? 'Quarterly' : 'Annual';

  try {
    const company = await AppDataSource.manager.findOne(Company, {
      where: { company_symbol: companySymbol },
    });

    if (!company) {
      throw new Error(`Company with symbol ${companySymbol} not found`);
    }

    // Get the latest report date from the database for this company and specific report type (Quarterly or Annual).
    const latestReportInDb = await AppDataSource.manager.findOne(
      FinancialReport,
      {
        where: { company_id: company.company_id, type: reportType },
        order: { publish_time: 'DESC' },
      },
    );

    const latestDateInDb = latestReportInDb
      ? latestReportInDb.publish_time
      : new Date(0); // If no report found, set to a very early date.

    const financialReports = await getFinancialReportData(
      companySymbol,
      isQuarterly,
      company.company_id,
    );

    for (const report of financialReports) {
      if (report.publish_time > latestDateInDb) {
        await AppDataSource.manager.save(report);
      } else {
        // Since reports are in order, we can break once we hit a report date that's
        // not greater than the latest in DB.
        break;
      }
    }
    console.log('finish');
  } catch (error) {
    throw new Error(`Error while updating financial reports: ${error.message}`);
  }
}

async function getCompanyAllFinancialReport(
  companySymbol: string,
  isQuarterly?: boolean,
  from?: Date,
  to?: Date,
): Promise<any> {
  try {
    const company = await AppDataSource.manager.findOne(Company, {
      where: { company_symbol: companySymbol },
    });

    if (!company) {
      throw new Error(`Company with symbol ${companySymbol} not found`);
    }

    let whereClause: any = { company_id: company.company_id };

    if (isQuarterly !== null) {
      const reportType = isQuarterly ? 'Quarterly' : 'Annual';
      whereClause = {
        ...whereClause,
        type: reportType,
      };
    }

    if (from && to) {
      whereClause = {
        ...whereClause,
        publish_time: Between(from, to),
      };
    } else if (from) {
      whereClause = {
        ...whereClause,
        publish_time: MoreThan(from),
      };
    } else if (to) {
      whereClause = {
        ...whereClause,
        publish_time: LessThan(to),
      };
    }

    const financialReports = await AppDataSource.manager.find(FinancialReport, {
      where: whereClause,
      order: { publish_time: 'ASC' },
    });

    return financialReports;
  } catch (error) {
    throw new Error(`Error fetching financial reports: ${error.message}`);
  }
}

export {
  saveAllFinancialReportInfoBySymbol,
  updateFinancialReportInfoBySymbol,
  getCompanyAllFinancialReport,
};
