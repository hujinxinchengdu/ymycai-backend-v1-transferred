/**
 * This file contains routes that proxy the "/api/news" path.
 */

import express, { Request, Response, NextFunction } from 'express';
import {
  findNewsByTopic,
  findNewsByCompany,
  updateNewsSummary,
  findAllNews,
  findHourlyOrDailyNewsByTime,
} from '../controllers';

const router = express.Router();

/**
 * @route GET /api/news/topic/:topic
 * @description
 *
 * @param {}
 *
 * @returns {}
 */
router.get(
  '/topic/:topic',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt((req.query.page as string) || '1');
      const pageSize = parseInt((req.query.pageSize as string) || '10');
      const topicName = req.params.topic;
      const news = await findNewsByTopic(topicName, page, pageSize);
      return res.status(200).json(news);
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @route GET /api/news/company/:company
 * @description
 *
 * @param {}
 *
 * @returns {}
 */
router.get(
  '/company/:company',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('dddd');
      const page = parseInt((req.query.page as string) || '1');
      const pageSize = parseInt((req.query.pageSize as string) || '10');

      const companyLabel = req.params.company;
      const news = await findNewsByCompany(companyLabel, page, pageSize);
      return res.status(200).json(news);
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @route GET /api/news/latest
 * @description Fetch the latest news data from the past hour.
 *
 * @returns {News[]} An array of news articles from the past hour.
 */
router.get(
  '/hourly_news',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hoursAgo = req.query.hoursAgo
        ? parseInt(req.query.hoursAgo as string, 10)
        : 1; // Fetch news from the past hour
      const latestNews = await findHourlyOrDailyNewsByTime(hoursAgo, true);

      return res.status(200).json({
        status: 200,
        message: 'Successfully retrieved the latest news from the past hour.',
        data: latestNews,
      });
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @route GET /api/news/latest
 * @description Fetch the latest news data from the past hour.
 *
 * @returns {News[]} An array of news articles from the past hour.
 */
router.get(
  '/daily_news',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hoursAgo = req.query.hoursAgo
        ? parseInt(req.query.hoursAgo as string, 10)
        : 1; // Fetch news from the past hour
      const latestNews = await findHourlyOrDailyNewsByTime(hoursAgo, false);
      return res.status(200).json({
        status: 200,
        message: 'Successfully retrieved the latest news from the past hour.',
        data: latestNews,
      });
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @route GET /api/news/:newsId
 * @description
 *
 * @param {}
 *
 * @returns {}
 */
router.put(
  '/:newsId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newsId = req.params.newsId;
      const aiSummary = req.body.ai_summary;
      const updatedNews = await updateNewsSummary(newsId, aiSummary);
      return res.status(200).json(updatedNews);
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @route GET /api/news/all
 * @description
 *
 * @param {}
 *
 * @returns {}
 */
router.get('/all', async (req: Request, res: Response, next: NextFunction) => {
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
