import express from 'express';

// import { savePhoto, findPhoto } from '../controllers';
import {
  findNewsByTopic,
  findNewsByCompany,
  updateNewsSummary,
  getCompanyInfoAndTags,
  getListOfCompanyInfoAndTags,
  // saveMarketHistoricalData,
  getAllCompanies,
  saveAllFinancialReportInfoBySymbol,
  updateFinancialReportInfoBySymbol,
  findAllNews,
  // saveMarketNewData,
  // getLatestMarketData,
  // getDayBeforeLatestMarketData,
  getCompanyAllFinancialReport,
} from '../controllers';
// import { getMarketHistoricalData } from '../services';

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

// router.get('/news/topic/:topic', async (req, res) => {
//   try {
//     const topicName = req.params.topic;
//     const news = await findNewsByTopic(topicName);
//     return res.status(200).json(news);
//   } catch (error) {
//     return res.status(500).json({ error: error.toString() });
//   }
// });

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

router.get('/news', async (req, res) => {
  try {
    // 获取查询参数以便进行分页
    const page = parseInt((req.query.page as string) || '1');
    const pageSize = parseInt((req.query.pageSize as string) || '10');
    const news = await findAllNews(page, pageSize);

    return res.status(200).json(news);
  } catch (error) {
    return res.status(500).json({ error: error.toString() });
  }
});

// router.get('/marketHistoricalData', async (req, res) => {
//   try {
//     const saveStatus = await saveMarketHistoricalData();
//     console.log('success');
//     return res.json(saveStatus);
//   } catch (error) {
//     return res.status(500).json({ error: error.toString() });
//   }
// });

router.post('/financial-reports/:companySymbol', async (req, res) => {
  try {
    const companySymbol = req.params.companySymbol;
    const isQuarterly = req.body.isQuarterly;

    if (typeof isQuarterly !== 'boolean') {
      return res
        .status(400)
        .json({ error: 'isQuarterly must be a boolean value.' });
    }

    await saveAllFinancialReportInfoBySymbol(companySymbol, isQuarterly);
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

router.get('/financial-reports/:companySymbol', async (req, res) => {
  try {
    const companySymbol = req.params.companySymbol;
    const isQuarterly = req.query.isQuarterly === 'true'; // Convert query param to boolean
    const from = req.query.from
      ? new Date(req.query.from as string)
      : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;

    if (typeof isQuarterly !== 'boolean') {
      return res
        .status(400)
        .json({ error: 'isQuarterly must be a boolean value.' });
    }

    const financialReports = await getCompanyAllFinancialReport(
      companySymbol,
      isQuarterly,
      from,
      to,
    );

    return res.status(200).json(financialReports);
  } catch (error) {
    return res.status(500).json({ error: error.toString() });
  }
});

// router.get('/marketNewData', async (req, res) => {
//   try {
//     const saveStatus = await saveMarketNewData();
//     console.log('success');
//     res.json(saveStatus);
//   } catch (error) {
//     res.status(500).json({ error: error.toString() });
//   }
// });

// router.get('/market-latest-data/:companyID', async (req, res) => {
//   try {
//     const companyID = req.params.companyID;
//     const saveStatus = await getLatestMarketData(companyID);
//     console.log('success：' + saveStatus);
//     res.json(saveStatus);
//   } catch (error) {
//     res.status(500).json({ error: error.toString() });
//   }
// });

// router.get('/market-day-before-latest-data/:companyID', async (req, res) => {
//   try {
//     const companyID = req.params.companyID;
//     const saveStatus = await getDayBeforeLatestMarketData(companyID);
//     console.log('success');
//     res.json(saveStatus);
//   } catch (error) {
//     res.status(500).json({ error: error.toString() });
//   }
// });

export default router;
