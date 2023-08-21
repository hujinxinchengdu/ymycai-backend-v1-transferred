export interface GetNewsReqParamsModel {
  pageNum: number;
  pageSize: number;
  sortBy: string;
  sortOrder: string;
  newsTag?: string;
  newsTimeScope?: string;
  searchTerm?: string;
}

export interface NewsItemModel {
  datetime: string;
  content: string;
  title: string;
  topics: string[];
  overallSentimentLabel: string;
}

export interface GetNewsResponseModel {
  news: NewsItemModel[];
}

export interface FilteredNewsDataModel {
  [key: string]: { news: NewsItemModel[] };
}

// GET /api/news/topic/:topic

// GET /api/news/company/:company

// PUT /api/news/:newsId

// GET /api/news/all
