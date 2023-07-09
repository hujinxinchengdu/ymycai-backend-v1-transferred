import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { News, Photo } from '../models';
import * as fs from 'fs';

if (fs.existsSync(`.env.${process.env.NODE_ENV}`)) {
  config({ path: `.env.${process.env.NODE_ENV}` });
} else {
  console.log('Using default .env file');
  config();
}

// const host: string = process.env.HOST as string;
// const port: number = parseInt(process.env.DATABASE_PORT as string, 10);
// const username: string = process.env.USERNAME as string;
// const password: string = process.env.PASSWORD as string;
// const database: string = process.env.DATABASE as string;

const host: string = 'localhost';
const port: number = 5432;
const username: string = 'postgres';
const password: string = 'Wtj19971010';
const database: string = 'StockAi';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: host,
  port: port,
  username: username,
  password: password,
  database: database,
  entities: [News],
  synchronize: true,
  logging: false,
});
