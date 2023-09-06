import express, { Request, Response, NextFunction } from 'express';
import {
  findNewsByTopic,
  findNewsByCompany,
  updateNewsSummary,
  findAllNews,
} from '../controllers';

const router = express.Router();

export { router };
