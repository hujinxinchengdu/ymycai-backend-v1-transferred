import express, { Request, Response, NextFunction } from 'express';
import {
  saveAllMarketNewData,
  getLatestMarketData,
  getDayBeforeLatestMarketData,
  saveCompanyQuoteDataByCompanySymbolList,
  updateAllCompanyQuoteData,
  getLatestCompanyQuoteDataByCompanySymbolList,
  getMarketDataByIdentifier,
  saveMarketNewDataBySymbol,
} from '../controllers';
import { scheduleDailyCall } from '../utils/schedule-call';
import { MarketData } from '../models';

const router = express.Router();

/**
 * @route PUT /api/market_data/company_quote
 * @description Update the market data for the provided company symbols.
 *
 * @param {symbolList: string[]} req.body - An array containing the company symbols for which the market data should be updated.
 *
 * @returns {Object} An object containing a success message or an error message.
 *
 * Example Success Response:
 * {
 *   message: "Successfully updated market data for AAPL, GOOGL, MSFT"
 * }
 *
 * Example Error Response:
 * {
 *   error: "No company symbols provided"
 * }
 */
router.put(
  '/company_quote',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const symbolList = req.body.symbolList;

      if (!symbolList || symbolList.length === 0) {
        return res.status(400).json({ error: 'No company symbols provided' });
      }

      await saveCompanyQuoteDataByCompanySymbolList(symbolList);

      return res.status(200).json({
        message: `Successfully updated market data for ${symbolList.join(
          ', ',
        )}`,
      });
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @route PUT /api/market_data/save_new_market_data
 * @description 刷新所有的公司市场数据
 *
 * @param {}
 *
 * @returns {}
 */
router.put(
  '/save_new_market_data',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await saveAllMarketNewData();
      console.log('success');
      return res
        .status(200)
        .json({ status: 200, message: `Successfully updated all market data` });
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @route GET /api/market_data/schedule_save_new_market_data
 * @description
 *
 * @param {}
 *
 * @returns {}
 */
router.get(
  '/schedule_save_new_market_data',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const saveStatus = await scheduleDailyCall();
      console.log('success');
      res.json(saveStatus);
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @route GET /api/market_data/latest_day_data/:companySymbol
 * @description 获取公司最后一天的价格数据
 *
 * @param {string} companySymbol 公司symbol诸如GOOG
 *
 * @returns {MarketData} 公司最后一天的价格相关数据
 */
router.get(
  '/latest_day_data/:companySymbol',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companySymbol = req.params.companySymbol;
      const saveStatus = await getLatestMarketData(companySymbol);
      return res.status(200).json(saveStatus);
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @route GET /api/market_data/day_before_latest_data/:companySymbol
 * @description 获取前一天的市场数据
 *
 * @param {string} companySymbol 公司symbol诸如GOOG
 *
 * @returns {MarketData} 公司前一天的市场数据
 */
router.get(
  '/day_before_latest_data/:companySymbol',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companySymbol = req.params.companySymbol;
      const saveStatus = await getDayBeforeLatestMarketData(companySymbol);
      return res.status(200).json(saveStatus);
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @route GET /api/market_data/:identifier
 * @description 根据公司symbol或companyId获取所有的行情数据
 *
 * @param {string} identifier 公司symbol诸如GOOG或companyId
 *
 * @returns {Array<MarketData>}
 */
router.get(
  '/:identifier',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = req.params.identifier;
      const limit = parseInt(req.query.limit as string) || 2000;
      const offset = parseInt(req.query.offset as string) || 0;

      let marketData: MarketData[] = [];

      if (identifier.length === 36 && identifier.includes('-')) {
        marketData = await getMarketDataByIdentifier(
          { companyId: identifier },
          limit,
          offset,
        );
      } else {
        marketData = await getMarketDataByIdentifier(
          { symbol: identifier },
          limit,
          offset,
        );
      }

      return res.status(200).json(marketData);
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  '/saveMarketData/:company_symbol',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const company_symbol = req.params.company_symbol; // 从URL获取公司标识符

      // 获取并保存市场数据
      await saveMarketNewDataBySymbol(company_symbol);

      // 返回状态码200和最新的市场数据
      return res.status(200).json({ message: '成功储存数据' });
    } catch (error) {
      return next(error); // 如果有错误，将其传递给下一个中间件
    }
  },
);

/**
 * @route POST /api/market_data/company_quote
 * @description Fetch market quote data for companies based on their symbols.
 *
 * @param {GetMultiCompanyInfosReqBodyModel} req.body List of desired company symbols.
 *
 * @returns {Object} The market quote data for the companies.
 */
router.post(
  '/company_quote',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let companyQuotes;

      // 检查请求体中是否有 "symbolList"
      if (req.body && Array.isArray(req.body.symbolList)) {
        const { symbolList } = req.body;
        // 根据symbolList获取数据
        companyQuotes = await saveCompanyQuoteDataByCompanySymbolList(
          symbolList,
        );
      } else {
        // 没有提供symbolList，获取所有数据
        companyQuotes = await updateAllCompanyQuoteData();
      }

      return res.status(200).json({
        message: 'Successfully fetched market data',
        data: companyQuotes,
      });
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @route POST /api/market_data/company_quote
 * @description 根据symbol获取公司的company_quote市场报价数据
 *
 * @param {GetMultiCompanyInfosReqBodyModel} req.body 想要的公司symbol列表
 *
 * @returns {}
 */
router.post(
  '/company_quote_last',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const symbolList: string[] = req.body.symbolList;

      if (!symbolList || symbolList.length === 0) {
        return res.status(400).json({ error: 'No company symbols provided' });
      }

      const companyQuotes = await getLatestCompanyQuoteDataByCompanySymbolList(
        symbolList,
      );

      return res.status(200).json({
        message: `Successfully fetched market data for ${symbolList.join(
          ', ',
        )}`,
        data: companyQuotes,
      });
    } catch (error) {
      return next(error);
    }
  },
);

export default router;
