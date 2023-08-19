/**
 * This file contains routes that proxy the "/api/financial-reports" path.
 */

import express from 'express';
import {
  saveAllFinancialReportInfoBySymbol,
  updateFinancialReportInfoBySymbol,
  getCompanyAllFinancialReport,
} from '../controllers';

const router = express.Router();

router.post('/:companySymbol', async (req, res, next) => {
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
    });
  } catch (error) {
    return next(error);
  }
});

router.put('/:companySymbol', async (req, res, next) => {
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
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/:companySymbol', async (req, res, next) => {
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

    const financialReports = await getCompanyAllFinancialReport(
      companySymbol,
      isQuarterly,
      from,
      to,
    );

    return res.status(200).json(financialReports);
  } catch (error) {
    return next(error);
  }
});

export default router;
