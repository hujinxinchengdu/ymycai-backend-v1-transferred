import express from 'express';

// import { savePhoto, findPhoto } from '../controllers';
import {
  findNewsByTopic,
  findNewsByCompany,
  updateNewsSummary,
  getCompanyInfoAndTags,
  getListOfCompanyInfoAndTags,
  saveMarketHistoricalData,
  getAllCompanies,
  getAllFinancialReportInfoBySymbol,
  updateFinancialReportInfoBySymbol,
} from '../controllers';
import { getMarketHistoricalData } from '../services';

const router = express.Router();

/**
 * 通过公司的Symbol获取单个公司的信息
 */
router.get('/companyinfos/:companySymbol', async (req, res) => {
  try {
    const companySymbol = req.params.companySymbol;
    const companyInfo = await getCompanyInfoAndTags(companySymbol);
    return res.status(200).json(companyInfo);
  } catch (error) {
    return res.status(500).json({ error: error.toString() });
  }
});

/**
 * 通过公司Symbol的list来获取多个公司的信息.
 */
router.post('/companyinfos', async (req, res) => {
  try {
    const companySymbols = req.body.companySymbols; // 从请求体中获取公司符号列表
    if (!Array.isArray(companySymbols)) {
      res.status(400).json({
        error: 'Invalid input: companySymbols should be an array of strings.',
      });
      return;
    }
    const companyInfoList = await getListOfCompanyInfoAndTags(companySymbols);
    return res.status(200).json(companyInfoList);
  } catch (error) {
    return res.status(500).json({ error: error.toString() });
  }
});

router.get('/companies', async (req, res) => {
  try {
    const companies = await getAllCompanies();
    return res.status(200).json(companies);
  } catch (error) {
    return res.status(500).json({ error: error.toString() });
  }
});

router.get('/news/topic/:topic', async (req, res) => {
  try {
    const topicName = req.params.topic;
    const news = await findNewsByTopic(topicName);
    return res.status(200).json(news);
  } catch (error) {
    return res.status(500).json({ error: error.toString() });
  }
});

router.get('/news/company/:company', async (req, res) => {
  try {
    const companyLabel = req.params.company;
    const news = await findNewsByCompany(companyLabel);
    return res.status(200).json(news);
  } catch (error) {
    return res.status(500).json({ error: error.toString() });
  }
});

router.put('/news/:newsId', async (req, res) => {
  try {
    const newsId = req.params.newsId;
    const aiSummary = req.body.ai_summary;
    const updatedNews = await updateNewsSummary(newsId, aiSummary);
    return res.status(200).json(updatedNews);
  } catch (error) {
    return res.status(500).json({ error: error.toString() });
  }
});

router.get('/marketHistoricalData', async (req, res) => {
  try {
    const saveStatus = await saveMarketHistoricalData();
    console.log('success');
    return res.json(saveStatus);
  } catch (error) {
    return res.status(500).json({ error: error.toString() });
  }
});

router.post('/financial-reports/:companySymbol', async (req, res) => {
  try {
    const companySymbol = req.params.companySymbol;
    const isQuarterly = req.body.isQuarterly;

    if (typeof isQuarterly !== 'boolean') {
      return res
        .status(400)
        .json({ error: 'isQuarterly must be a boolean value.' });
    }

    await getAllFinancialReportInfoBySymbol(companySymbol, isQuarterly);
    return res.status(200).json({
      message: `Successfully fetched financial reports for ${companySymbol}`,
    });
  } catch (error) {
    return res.status(500).json({ error: error.toString() });
  }
});

router.put('/financial-reports/:companySymbol', async (req, res) => {
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
    return res.status(500).json({ error: error.toString() });
  }
});

export default router;
