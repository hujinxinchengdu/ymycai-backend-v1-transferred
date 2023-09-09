import { AppDataSource } from '../configuration';
import {
  getFinancialReportData,
  formFinancialReportAnalysis,
} from '../services';
import { Company, FinancialReport, FinancialAnalysis } from '../models';
import { Between, MoreThan, LessThan } from 'typeorm';
import { IFinancialAnalysisModel } from '../models';

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
): Promise<FinancialReport[]> {
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

async function getCompanyAllFinancialAnalyses(
  companySymbol: string,
  isQuarterly?: boolean,
  from?: Date,
  to?: Date,
): Promise<IFinancialAnalysisModel[]> {
  try {
    // Fetch the company entity by its symbol
    const company = await AppDataSource.manager.findOne(Company, {
      where: { company_symbol: companySymbol },
    });

    // Check if the company exists
    if (!company) {
      throw new Error(`Company with symbol ${companySymbol} not found`);
    }

    let whereClause: any = { company_id: company.company_id };

    // Check if isQuarterly is specified and add it to the where clause
    if (isQuarterly !== undefined) {
      const reportType = isQuarterly ? 'Quarterly' : 'Annual';
      whereClause = {
        ...whereClause,
        type: reportType,
      };
    }

    // Check if from and to dates are specified and add them to the where clause
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

    // Fetch the financial analyses based on the where clause
    const financialAnalyses = await AppDataSource.manager.find(
      FinancialAnalysis,
      {
        where: whereClause,
        order: { publish_time: 'DESC' },
      },
    );

    return financialAnalyses;
  } catch (error) {
    throw new Error(`Error fetching financial analyses: ${error.message}`);
  }
}

async function getAllCompanies(): Promise<Company[]> {
  return await AppDataSource.manager.find(Company);
}

async function updateAllCompaniesFinancialReportsInBatches(): Promise<void> {
  try {
    // 获取所有公司
    const allCompanies = await getAllCompanies();

    const BATCH_SIZE = 10; // 可以根据需要调整这个数值

    for (let i = 0; i < allCompanies.length; i += BATCH_SIZE) {
      const companyBatch = allCompanies.slice(i, i + BATCH_SIZE);

      // 使用 Promise.all 来并发更新这一批公司的财报
      await Promise.all(
        companyBatch.map(async (company) => {
          await updateFinancialReportInfoBySymbol(
            company.company_symbol,
            false,
          );
          await updateFinancialReportInfoBySymbol(company.company_symbol, true);
        }),
      );
    }

    console.log("Finished updating all companies' financial reports.");
  } catch (error) {
    console.log(
      `Error while updating all companies\' financial reports: ${error.message}`,
    );
  }
}

// async function saveAllFinancialReportInfoBySymbol(
//   companySymbol: string,
//   isQuarterly: boolean,
// ): Promise<void> {
//   if (typeof isQuarterly !== 'boolean') {
//     throw new Error('The isQuarterly parameter must be a boolean.');
//   }

//   try {
//     const company = await AppDataSource.manager.findOne(Company, {
//       where: { company_symbol: companySymbol },
//     });

//     if (!company) {
//       throw new Error(`Company with symbol ${companySymbol} not found`);
//     }

//     const financialReports = await getFinancialReportData(
//       companySymbol,
//       isQuarterly,
//       company.company_id,
//     );

//     for (const report of financialReports) {
//       const existingReport = await AppDataSource.manager.findOne(
//         FinancialReport,
//         {
//           where: {
//             publish_time: report.publish_time,
//             company_id: report.company_id,
//           },
//         },
//       );

//       console.log('start saving');

//       if (!existingReport) {
//         await AppDataSource.manager.save(report);
//       }
//     }
//     console.log('finish');
//   } catch (error) {
//     throw new Error(`Error while fetching company: ${error.message}`);
//   }
// }

export {
  // saveAllFinancialReportInfoBySymbol,
  updateFinancialReportInfoBySymbol,
  getCompanyAllFinancialReport,
  getCompanyAllFinancialAnalyses,
  updateAllCompaniesFinancialReportsInBatches,
};
