import { News } from '../models';
import { AppDataSource } from '../configuration';

export async function saveNews(newsData: Partial<News>): Promise<News> {
  const news = new News();
  news.title = newsData.title || 'Default Title';
  news.url = newsData.url || 'None';
  news.publishedTime = newsData.publishedTime;
  news.bannerImage = newsData.bannerImage || 'default.jpg';
  news.overallSentimentScore = newsData.overallSentimentScore || 0;
  news.overallSentimentLable = newsData.overallSentimentLable || 'None';
  news.aiSummeryTime = newsData.aiSummeryTime;
  news.importantSource = newsData.importantSource || 'None';

  try {
    const savedNews = await AppDataSource.manager.save(news);
    return savedNews;
  } catch (error) {
    throw new Error(`Error while saving news: ${error.message}`);
  }
}

export async function findNews(): Promise<News[]> {
  try {
    const savedNews = await AppDataSource.manager.find(News);
    return savedNews;
  } catch (error) {
    throw new Error(`Error while fetching new: ${error.message}`);
  }
}
