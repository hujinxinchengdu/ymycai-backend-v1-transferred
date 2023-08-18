import { News } from '../models';
import { AppDataSource } from '../configuration';

interface NewsInfo {
  news: News[];
  currentPage: string;
  totalPages: string;
}

async function saveNews(newsData: Partial<News>): Promise<News> {
  const news = new News();
  news.title = newsData.title || 'Default Title';
  news.url = newsData.url || 'None';
  news.published_time = newsData.published_time || new Date();
  news.banner_image = newsData.banner_image || 'default.jpg';
  news.overall_sentiment_score = newsData.overall_sentiment_score || 0;
  news.overall_sentiment_label = newsData.overall_sentiment_label || 'N/A';
  news.ai_summary_time = newsData.ai_summary_time || new Date();
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

async function findNewsByTopic(
  topicName: String,
  page: number,
  pageSize: number,
): Promise<News[]> {
  try {
    const skip = (page - 1) * pageSize; // 计算需要跳过的记录数

    const relatedNews = await AppDataSource.manager
      .createQueryBuilder(News, 'news')
      .leftJoinAndSelect('news.topics', 'topic') // 连接并获取相关的topic
      .innerJoin('topics_to_news', 'tn', 'tn.news_id = news.news_id')
      .innerJoin('topics', 't', 'tn.topic_id = t.topic_id')
      .where('t.name = :topicName', { topicName })
      .skip(skip) // 使用.skip()方法跳过记录
      .take(pageSize) // 使用.take()方法限制返回的记录数
      .getMany();

    return relatedNews;
  } catch (error) {
    throw new Error(`Error while fetching news: ${error.message}`);
  }
}

async function findNewsById(newsId: string): Promise<News> {
  try {
    const newsItem = await AppDataSource.manager
      .createQueryBuilder(News, 'news')
      .leftJoinAndSelect('news.topics', 'topic') // 连接并获取相关的topic
      .where('news.news_id = :newsId', { newsId })
      .getOne(); // 获取单一新闻实例

    if (!newsItem) {
      throw new Error('News not found.');
    }

    return newsItem;
  } catch (error) {
    throw new Error(`Error while fetching news: ${error.message}`);
  }
}

async function findNewsByCompany(
  ticker: String,
  page: number,
  pageSize: number,
): Promise<News[]> {
  try {
    const skip = (page - 1) * pageSize; // 计算需要跳过的记录数

    const relatedNews = await AppDataSource.manager
      .createQueryBuilder(News, 'news')
      .leftJoinAndSelect('news.topics', 'topic') // 连接并获取相关的topic
      .innerJoin('news_to_companies', 'cn', 'cn.news_id = news.news_id')
      .innerJoin('companies', 'c', 'cn.company_id = c.company_id')
      .where('c.company_symbol = :ticker', { ticker })
      .skip(skip) // 使用.skip()方法跳过记录
      .take(pageSize) // 使用.take()方法限制返回的记录数
      .getMany();

    return relatedNews;
  } catch (error) {
    throw new Error(`Error while fetching news: ${error.message}`);
  }
}

async function findAllNews(
  page: number = 1,
  pageSize: number = 10,
): Promise<News[]> {
  try {
    const skip = (page - 1) * pageSize; // 计算需要跳过的记录数

    const allNews = await AppDataSource.manager
      .createQueryBuilder(News, 'news')
      .leftJoinAndSelect('news.topics', 'topic') // 连接并获取相关的topic
      .orderBy('news.published_time', 'DESC') // 按发布时间降序排序
      .skip(skip) // 使用.skip()方法跳过记录
      .take(pageSize) // 使用.take()方法限制返回的记录数
      .getMany();

    return allNews;
  } catch (error) {
    throw new Error(`Error while fetching news: ${error.message}`);
  }
}

async function updateNewsSummary(
  news_id: string,
  aiSummary: string,
): Promise<{ news_id: string }> {
  try {
    const newsToUpdate = await AppDataSource.manager.findOne(News, {
      where: { news_id: news_id },
    });
    if (!newsToUpdate) {
      throw new Error('News not found');
    }
    newsToUpdate.ai_summary_en = aiSummary;
    const updatedNews = await AppDataSource.manager.save(newsToUpdate);
    return updatedNews;
  } catch (error) {
    throw new Error(`Error while updating news summary: ${error.message}`);
  }
}

export {
  findNews,
  saveNews,
  findNewsByTopic,
  findNewsByCompany,
  findAllNews,
  updateNewsSummary,
};
