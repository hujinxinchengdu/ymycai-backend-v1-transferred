import express from 'express';

// import { savePhoto, findPhoto } from '../controllers';
import { saveNews, findNews, findNewsByTopic } from '../controllers';
import { getCompanyInfoAndTags } from '../controllers/CompanyInfo';

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

router.get('/news/:topic', async (req, res) => {
  try {
    const topicName = req.params.topic;
    const news = await findNewsByTopic(topicName);
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

export default router;
