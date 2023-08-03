import express from 'express';

// import { savePhoto, findPhoto } from '../controllers';
import {
  saveNews,
  findNews,
  findNewsByTopic,
  findNewsByCompany,
  updateNewsSummary,
  getCompanyInfoAndTags,
  getListOfCompanyInfoAndTags,
} from '../controllers';

const router = express.Router();

/**
 * 通过公司的Symbol获取单个公司的信息
 */
router.get('/companyinfos/:companySymbol', async (req, res) => {
  try {
    const companySymbol = req.params.companySymbol;
    const companyInfo = await getCompanyInfoAndTags(companySymbol);
    res.status(200).json(companyInfo);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

/**
 * 通过公司Symbol的list来获取多个公司的信息.
 */
router.post('/companyinfos', async (req, res) => {
  try {
    const companySymbols = req.body.companySymbols; // 从请求体中获取公司符号列表
    if (!Array.isArray(companySymbols)) {
      res
        .status(400)
        .json({
          error: 'Invalid input: companySymbols should be an array of strings.',
        });
      return;
    }
    const companyInfoList = await getListOfCompanyInfoAndTags(companySymbols);
    res.status(200).json(companyInfoList);
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

export default router;
