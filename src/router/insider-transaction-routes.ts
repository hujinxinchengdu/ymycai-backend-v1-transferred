import express from 'express';
import {
  getTransactionBySymbol,
  saveAllCompanyTransaction,
  saveAllTransaction,
} from '../controllers/insider_trading_usecase';

const router = express.Router();

/**
 * @route GET /api/insider_transactions/save_all_transaction
 * @description
 *
 * @param {}
 *
 * @returns {}
 */
router.get('/save_all_transaction', async (req, res, next) => {
  try {
    const insiderTransactions = await saveAllTransaction();
    return res.status(200).json(insiderTransactions);
  } catch (error) {
    return next(error);
  }
});

/**
 * @route GET /api/insider_transactions/save_all_transaction
 * @description
 *
 * @param {}
 *
 * @returns {}
 */
router.get('/get_transaction_by_symbol/:symbol', async (req, res, next) => {
  try {
    const page = parseInt((req.query.page as string) || '1');
    const pageSize = parseInt((req.query.pageSize as string) || '10');
    const symbol = req.params.symbol;
    const insiderTransactions = await getTransactionBySymbol(
      symbol,
      page,
      pageSize,
    );
    return res.status(200).json(insiderTransactions);
  } catch (error) {
    return next(error);
  }
});

/**
 * @route GET /api/insider_transactions/save_all_transaction
 * @description
 *
 * @param {}
 *
 * @returns {}
 */
router.get('/save_all_company_transaction', async (req, res, next) => {
  try {
    const insiderTransactions = await saveAllCompanyTransaction();
    return res.status(200).json(insiderTransactions);
  } catch (error) {
    return next(error);
  }
});

export default router;
