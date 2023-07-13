import { News } from '../models';
import { AppDataSource } from '../configuration';

async function saveNews(newsData: Partial<News>): Promise<News> {
  const news = new News();
  news.title = newsData.title || 'Default Title';
  news.url = newsData.url || 'None';
  news.published_time = newsData.published_time || new Date();
  news.banner_image = newsData.banner_image || 'default.jpg';
  news.overall_sentiment_score = newsData.overall_sentiment_score || 0;
  news.overall_sentiment_label = newsData.overall_sentiment_label || 0;
  news.ai_summery_time = newsData.ai_summery_time || new Date();

  try {
    const savedNews = await AppDataSource.manager.save(news);
    return savedNews;
  } catch (error) {
    throw new Error(`Error while saving news: ${error.message}`);
  }
}

async function findNews(): Promise<News[]> {
  try {
    const savedNews = await AppDataSource.manager.find(News);
    return savedNews;
  } catch (error) {
    throw new Error(`Error while fetching new: ${error.message}`);
  }
}

export { findNews, saveNews };
