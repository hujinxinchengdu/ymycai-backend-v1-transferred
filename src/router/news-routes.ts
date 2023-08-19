/**
 * This file contains routes that proxy the "/api/news" path.
 */

import express from 'express';
import {
  findNewsByTopic,
  findNewsByCompany,
  updateNewsSummary,
  findAllNews,
} from '../controllers';

const router = express.Router();

router.get('/topic/:topic', async (req, res, next) => {
  try {
    const page = parseInt((req.query.page as string) || '1');
    const pageSize = parseInt((req.query.pageSize as string) || '10');
    const topicName = req.params.topic;
    const news = await findNewsByTopic(topicName, page, pageSize);
    return res.status(200).json(news);
  } catch (error) {
    return next(error);
  }
});

router.get('/company/:company', async (req, res, next) => {
  try {
    const page = parseInt((req.query.page as string) || '1');
    const pageSize = parseInt((req.query.pageSize as string) || '10');

    const companyLabel = req.params.company;
    const news = await findNewsByCompany(companyLabel, page, pageSize);
    return res.status(200).json(news);
  } catch (error) {
    return next(error);
  }
});

router.put('/:newsId', async (req, res, next) => {
  try {
    const newsId = req.params.newsId;
    const aiSummary = req.body.ai_summary;
    const updatedNews = await updateNewsSummary(newsId, aiSummary);
    return res.status(200).json(updatedNews);
  } catch (error) {
    return next(error);
  }
});

router.get('/all', async (req, res, next) => {
  try {
    // 获取查询参数以便进行分页
    const page = parseInt((req.query.page as string) || '1');
    const pageSize = parseInt((req.query.pageSize as string) || '10');
    const news = await findAllNews(page, pageSize);

    return res.status(200).json(news);
  } catch (error) {
    return next(error);
  }
});

export default router;
