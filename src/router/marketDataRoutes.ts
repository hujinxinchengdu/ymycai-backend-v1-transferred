import express from 'express';
import { saveMarketHistoricalData } from '../controllers';

const router = express.Router();

router.get('/marketHistoricalData', async (req, res) => {
  try {
    const saveStatus = await saveMarketHistoricalData();
    console.log('success');
    res.json(saveStatus);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

export default router;
