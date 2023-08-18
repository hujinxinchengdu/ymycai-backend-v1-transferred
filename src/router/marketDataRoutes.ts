import express from 'express';
import {
  saveMarketHistoricalData,
  saveMarketNewData,
  getLatestMarketData,
  getDayBeforeLatestMarketData,
  getMarketDataByCompanySymbol,
  saveCompanyQuoteDataByCompanySymbolList,
} from '../controllers';
import { ScheduleDailyCall } from '../utils/ScheduleCall';

const router = express.Router();

router.put('/company_quote', async (req, res) => {
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
    return res.status(500).json({ error: error.toString() });
  }
});

router.get('/historical_data', async (req, res) => {
  try {
    const saveStatus = await saveMarketHistoricalData();
    console.log('success');
    res.json(saveStatus);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.get('/save_new_market_data', async (req, res) => {
  try {
    const saveStatus = await saveMarketNewData();
    console.log('success');
    res.json(saveStatus);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.get('/schedule_save_new_market_data', async (req, res) => {
  try {
    const saveStatus = await ScheduleDailyCall();
    console.log('success');
    res.json(saveStatus);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.get('/latest_day_data/:companySymbol', async (req, res) => {
  try {
    const companySymbol = req.params.companySymbol;
    const saveStatus = await getLatestMarketData(companySymbol);
    console.log('success：' + saveStatus);
    res.json(saveStatus);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.get('/day_before_latest_data/:companySymbol', async (req, res) => {
  try {
    const companySymbol = req.params.companySymbol;
    const saveStatus = await getDayBeforeLatestMarketData(companySymbol);
    console.log('success');
    res.json(saveStatus);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.get('/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol; // 从URL获取股票代码
    const marketData = await getMarketDataByCompanySymbol(symbol);
    res.status(200).json(marketData); // 明确设置状态码为200并返回JSON
  } catch (error) {
    res.status(500).json({ error: error.message }); // 设置状态码为500并返回错误信息
  }
});

export default router;
