import express from 'express';
import {
  saveMarketHistoricalData,
  saveMarketNewData,
  getLatestMarketData,
  getDayBeforeLatestMarketData,
} from '../controllers';

const router = express.Router();

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

export default router;
