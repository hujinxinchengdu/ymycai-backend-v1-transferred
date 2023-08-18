import { config } from 'dotenv';
import { DataSource } from 'typeorm';

import {
  Company,
  User,
  Tag,
  TradingNote,
  Watchlist,
  WatchlistToCompany,
  FinancialReport,
  FinancialAnalysis,
  MarketData,
  TechnicalIndicator,
  LongtermSignal,
  News,
  Topic,
  Recommendation,
  NewsToCompanies,
  EarningsCalendar,
  CompanyQuote,
} from '../models';

import * as fs from 'fs';

if (fs.existsSync(`.env.${process.env.NODE_ENV}`)) {
  console.log(`Using .env.${process.env.NODE_ENV} file`);
  config({ path: `.env.${process.env.NODE_ENV}` });
} else {
  console.error(
    `The .env.${process.env.NODE_ENV} file corresponding to NODE_ENV=${process.env.NODE_ENV} is not found!`,
  );
  console.warn('Using default .env file');
  config();
}

const host: string = process.env.HOST as string;
const port: number = parseInt(process.env.DATABASE_PORT as string, 10);
const username: string = process.env.DB_USER as string;
const password: string = process.env.PASSWORD as string;
const database: string = process.env.DATABASE as string;
console.log(username);
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: host,
  port: port,
  username: username,
  password: password,
  database: database,

  entities: [
    Company,
    User,
    Tag,
    TradingNote,
    Watchlist,
    WatchlistToCompany,
    FinancialReport,
    FinancialAnalysis,
    MarketData,
    TechnicalIndicator,
    LongtermSignal,
    News,
    Topic,
    Recommendation,
    NewsToCompanies,
    EarningsCalendar,
    CompanyQuote,
  ],

  synchronize: true,
  logging: false,
});
