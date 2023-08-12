import 'reflect-metadata';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { AppDataSource } from './configuration';
//router
import router from './router/routes';
import companyRoutes from './router/companyRoutes';
import newsRoutes from './router/marketDataRoutes';
import marketDataRoutes from './router/newsRoutes';

require('express-async-errors');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

//routers
app.use('/', router);
app.use('/api/companies', companyRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/marketdata', marketDataRoutes);

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
