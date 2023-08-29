/**
 * This file contains routes that proxy the "/api/financial-reports" path.
 */

import express, { Request, Response, NextFunction } from 'express';
import {
  saveAllFinancialReportInfoBySymbol,
  updateFinancialReportInfoBySymbol,
  getCompanyAllFinancialReport,
  getCompanyAllFinancialAnalyses,
} from '../controllers';
import {
  PostFinancialReportResponseModel,
  PutFinancialReportResponseModel,
  GetFinancialReportResponseModel,
  IFinancialAnalysisModel,
} from '../models';

const router = express.Router();

/**
 * @route POST /api/financial_reports/:companySymbol
 * @description
 *
 * @param {}
 *
 * @returns {PostFinancialReportResponseModel}
 */
router.post(
  '/:companySymbol',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companySymbol = req.params.companySymbol;
      const isQuarterly = req.body.isQuarterly;

      if (typeof isQuarterly !== 'boolean') {
        return res
          .status(400)
          .json({ error: 'isQuarterly must be a boolean value.' });
      }

      await saveAllFinancialReportInfoBySymbol(companySymbol, isQuarterly);

      return res.status(200).json({
        message: `Successfully fetched financial reports for ${companySymbol}`,
      } as unknown as PostFinancialReportResponseModel);
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @route PUT /api/financial_reports/:companySymbol
 * @description
 *
 * @param {}
 *
 * @returns {PutFinancialReportResponseModel}
 */
router.put(
  '/:companySymbol',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companySymbol = req.params.companySymbol;
      const isQuarterly = req.body.isQuarterly;

      if (typeof isQuarterly !== 'boolean') {
        return res
          .status(400)
          .json({ error: 'isQuarterly must be a boolean value.' });
      }

      await updateFinancialReportInfoBySymbol(companySymbol, isQuarterly);

      return res.status(200).json({
        message: `Successfully updated financial reports for ${companySymbol}`,
      } as unknown as PutFinancialReportResponseModel);
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @route GET /api/financial_reports/:companySymbol
 * @description Fetch financial reports for a specific company, filtered by whether the report is quarterly, and optionally between specific dates.
 *
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.companySymbol - Symbol of the company for which to fetch financial analyses.
 * @param {Object} req.query - Query parameters.
 * @param {boolean} [req.query.isQuarterly] - Optional. True if looking for quarterly reports, false for annual reports.
 * @param {string} [req.query.from] - Optional. The start date for the financial reports, in YYYY-MM-DD format.
 * @param {string} [req.query.to] - Optional. The end date for the financial reports, in YYYY-MM-DD format.
 *
 * @returns {GetFinancialReportResponseModel}
 */
router.get(
  '/:companySymbol',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companySymbol = req.params.companySymbol;
      const isQuarterly = req.query.isQuarterly === 'true'; // Convert query param to boolean
      const from = req.query.from
        ? new Date(req.query.from as string)
        : undefined;
      const to = req.query.to ? new Date(req.query.to as string) : undefined;

      if (typeof isQuarterly !== 'boolean') {
        return res
          .status(400)
          .json({ error: 'isQuarterly must be a boolean value.' });
      }

      const financialReports: GetFinancialReportResponseModel =
        (await getCompanyAllFinancialReport(
          companySymbol,
          isQuarterly,
          from,
          to,
        )) as unknown as GetFinancialReportResponseModel;

      return res.status(200).json(financialReports);
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @route GET /api/financial_reports/financial_analysis/:companySymbol
 * @description Fetch financial analyses for a specific company, filtered by whether the report is quarterly, and optionally between specific dates.
 *
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.companySymbol - Symbol of the company for which to fetch financial analyses.
 * @param {Object} req.query - Query parameters.
 * @param {boolean} [req.query.isQuarterly] - Optional. True if looking for quarterly reports, false for annual reports.
 * @param {string} [req.query.from] - Optional. The start date for the financial reports, in YYYY-MM-DD format.
 * @param {string} [req.query.to] - Optional. The end date for the financial reports, in YYYY-MM-DD format.
 *
 * @returns {IFinancialAnalysisWithUnionType[]} An array of financial analyses matching the provided parameters.
 */
router.get(
  '/financial_analysis/:companySymbol',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companySymbol = req.params.companySymbol;
      const isQuarterly = req.query.isQuarterly === 'true'; // Convert query param to boolean
      const from = req.query.from
        ? new Date(req.query.from as string)
        : undefined;
      const to = req.query.to ? new Date(req.query.to as string) : undefined;

      if (typeof isQuarterly !== 'boolean') {
        return res
          .status(400)
          .json({ error: 'isQuarterly must be a boolean value.' });
      }

      const financialAnalysis: IFinancialAnalysisModel =
        (await getCompanyAllFinancialAnalyses(
          companySymbol,
          isQuarterly,
          from,
          to,
        )) as unknown as IFinancialAnalysisModel;

      return res.status(200).json({
        status: 200,
        message: `Successfully got financial analysis data for ${companySymbol}`,
        data: financialAnalysis,
      });
    } catch (error) {
      return next(error);
    }
  },
);

export default router;
