import express from 'express';
import { saveAllTransaction } from '../controllers/insider_trading_usecase';

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

export default router;
