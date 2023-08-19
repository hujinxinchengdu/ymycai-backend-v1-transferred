import 'reflect-metadata';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { AppDataSource } from './configuration';
import companyRoutes from './router/company-routes';
import newsRoutes from './router/news-routes';
import marketDataRoutes from './router/market-data-routes';
import financialReportRoutes from './router/financial-report-routes';
import { Request, Response, NextFunction } from 'express';

require('express-async-errors');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

// 限制每分钟请求次数
const requestLimit: number = 5; // 设置每分钟请求次数限制
const interval: number = 60000; // 一分钟的毫秒数
const requestQueue: number[] = [];

// 中间件用于限制请求次数，仅应用于特定 API 路径
const requestLimiterMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 仅针对特定的 API 路径应用限制
  const restrictedPaths = ['/api/path1', '/api/path2']; // 你的特定路径列表

  if (restrictedPaths.includes(req.path)) {
    // 移除已过期的请求记录
    const currentTime: number = new Date().getTime();
    while (
      requestQueue.length > 0 &&
      currentTime - requestQueue[0] > interval
    ) {
      requestQueue.shift();
    }

    if (requestQueue.length >= requestLimit) {
      return res.status(429).json({ error: '请求过于频繁，请稍后重试。' });
    }

    requestQueue.push(currentTime);
  }

  next();
  return;
};

// 应用限制中间件到特定路径
app.use(requestLimiterMiddleware);

// 路由处理
app.get('/api/path1', async (req: Request, res: Response) => {
  // 处理 path1 的逻辑
});

//routers
app.use('/api/companies', companyRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/marketdata', marketDataRoutes);
app.use('/api/financial-reports', financialReportRoutes);

// Global error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: 'An error occurred.' });
  },
);

const PORT = process.env.PORT || 8111;

// Initialize database and start the server
AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => console.log(error));
