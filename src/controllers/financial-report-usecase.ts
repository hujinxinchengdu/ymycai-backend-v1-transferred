import { AppDataSource } from '../configuration';
import {
  getFinancialReportData,
  formFinancialReportAnalysis,
} from '../services';
import { Company, FinancialReport, FinancialAnalysis } from '../models';
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

  //确定是年报还是季报

  const reportType = isQuarterly ? 'Quarterly' : 'Annual';

  try {
    //查找公司id
    const company = await AppDataSource.manager.findOne(Company, {
      where: { company_symbol: companySymbol },
    });

    if (!company) {
      throw new Error(`Company with symbol ${companySymbol} not found`);
    }
    //查找距离current time最近的已有数据
    const latestReportInDb = await AppDataSource.manager.findOne(
      FinancialReport,
      {
        where: { company_id: company.company_id, type: reportType },
        order: { publish_time: 'DESC' },
      },
    );

    const latestDateInDb = latestReportInDb
      ? latestReportInDb.publish_time
      : new Date(0);

    //得到财报的数据
    const financialReports = await getFinancialReportData(
      companySymbol,
      isQuarterly,
      company.company_id,
    );

    const reportsToSave: FinancialReport[] = [];
    const analysesToSave: FinancialAnalysis[] = [];

    for (const report of financialReports) {
      if (report.publish_time > latestDateInDb) {
        const financialAnalysis = formFinancialReportAnalysis(
          report,
          company,
          reportType,
        );

        analysesToSave.push(financialAnalysis);
        reportsToSave.push(report);
      } else {
        break;
      }
    }

    // Batch save the reports
    const BATCH_SIZE = 500; // You can adjust this value as needed.

    for (let i = 0; i < reportsToSave.length; i += BATCH_SIZE) {
      const batch = reportsToSave.slice(i, i + BATCH_SIZE);
      const analysesBatch = analysesToSave.slice(i, i + BATCH_SIZE);

      await AppDataSource.manager.save(FinancialReport, batch);
      await AppDataSource.manager.save(FinancialAnalysis, analysesBatch);
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
      order: { publish_time: 'DESC' },
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
