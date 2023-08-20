/**
 * This file contains routes that proxy the "/api/marketdata" path.
 */

import express from 'express';
import {
  saveMarketNewData,
  getLatestMarketData,
  getDayBeforeLatestMarketData,
  getMarketDataByCompanySymbol,
  saveCompanyQuoteDataByCompanySymbolList,
  getCompanyQuoteDataByCompanySymbolList,
} from '../controllers';
import { scheduleDailyCall } from '../utils/schedule-call';

const router = express.Router();

router.put('/company_quote', async (req, res, next) => {
  try {
    const symbolList = req.body.symbolList;

    if (!symbolList || symbolList.length === 0) {
      return res.status(400).json({ error: 'No company symbols provided' });
    }

    await saveCompanyQuoteDataByCompanySymbolList(symbolList);

    return res.status(200).json({
      message: `Successfully updated market data for ${symbolList.join(', ')}`,
    });
  } catch (error) {
    return next(error);
  }
});

router.put('/save_new_market_data', async (req, res, next) => {
  try {
    await saveMarketNewData();
    console.log('success');
    return res
      .status(200)
      .json({ message: `Successfully updated all market data` });
  } catch (error) {
    return next(error);
  }
});

router.get('/schedule_save_new_market_data', async (req, res, next) => {
  try {
    const saveStatus = await scheduleDailyCall();
    console.log('success');
    res.json(saveStatus);
  } catch (error) {
    return next(error);
  }
});

router.get('/latest_day_data/:companySymbol', async (req, res, next) => {
  try {
    const companySymbol = req.params.companySymbol;
    const saveStatus = await getLatestMarketData(companySymbol);
    return res.status(200).json(saveStatus);
  } catch (error) {
    return next(error);
  }
});

router.get('/day_before_latest_data/:companySymbol', async (req, res, next) => {
  try {
    const companySymbol = req.params.companySymbol;
    const saveStatus = await getDayBeforeLatestMarketData(companySymbol);
    return res.status(200).json(saveStatus);
  } catch (error) {
    return next(error);
  }
});

router.get('/:symbol', async (req, res, next) => {
  try {
    const symbol = req.params.symbol; // 从URL获取股票代码
    const marketData = await getMarketDataByCompanySymbol(symbol);
    return res.status(200).json(marketData); // 明确设置状态码为200并返回JSON
  } catch (error) {
    return next(error);
  }
});

router.post('/company_quote', async (req, res, next) => {
  try {
    const symbolList: string[] = req.body.symbolList;

    if (!symbolList || symbolList.length === 0) {
      return res.status(400).json({ error: 'No company symbols provided' });
    }

    const companyQuotes = await getCompanyQuoteDataByCompanySymbolList(
      symbolList,
    );

    return res.status(200).json({
      message: `Successfully fetched market data for ${symbolList.join(', ')}`,
      data: companyQuotes,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
