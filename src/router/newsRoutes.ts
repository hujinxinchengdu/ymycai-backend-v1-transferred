import express from 'express';
import {
  findNewsByTopic,
  findNewsByCompany,
  updateNewsSummary,
} from '../controllers';

const router = express.Router();

router.get('/topic/:topic', async (req, res) => {
  try {
    const topicName = req.params.topic;
    const news = await findNewsByTopic(topicName);
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.get('/company/:company', async (req, res) => {
  try {
    const companyLabel = req.params.company;
    const news = await findNewsByCompany(companyLabel);
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.put('/:newsId', async (req, res) => {
  try {
    const newsId = req.params.newsId;
    const aiSummary = req.body.ai_summary;
    const updatedNews = await updateNewsSummary(newsId, aiSummary);
    res.json(updatedNews);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

export default router;
