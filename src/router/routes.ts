import express from 'express';

// import { savePhoto, findPhoto } from '../controllers';
import {
  findNewsByTopic,
  findNewsByCompany,
  updateNewsSummary,
  saveMarketHistoricalData,
} from '../controllers';
import { getCompanyInfoAndTags } from '../controllers/CompanyInfo';
import { getMarketHistoricalData } from '../services/MarketDataService';

const router = express.Router();

router.get('/companyinfos/:companySymbol', async (req, res) => {
  try {
    const companySymbol = req.params.companySymbol;
    const companyInfo = await getCompanyInfoAndTags(companySymbol);
    res.status(200).json(companyInfo);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.get('/news/topic/:topic', async (req, res) => {
  try {
    const topicName = req.params.topic;
    const news = await findNewsByTopic(topicName);
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.get('/news/company/:company', async (req, res) => {
  try {
    const companyLabel = req.params.company;
    const news = await findNewsByCompany(companyLabel);
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.put('/news/:newsId', async (req, res) => {
  try {
    const newsId = req.params.newsId;
    const aiSummary = req.body.ai_summary;
    const updatedNews = await updateNewsSummary(newsId, aiSummary);
    res.json(updatedNews);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.get('/marketHistoricalData', async (req, res) => {
  try {
    const marketData = await getMarketHistoricalData();
    const response = await saveMarketHistoricalData(marketData);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

export default router;
