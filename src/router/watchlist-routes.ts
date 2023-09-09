import express, { Request, Response, NextFunction } from 'express';
import {
  addCompanyToWatchlist,
  createNewWatchlist,
  deleteWatchlist,
  getUserWatchlists,
  removeCompanyFromWatchlist,
} from '../controllers';
const watchlistRouter = express.Router();

/**
 * @route POST /api/watchlist/create
 * @description 创建一个新的自选股列表。一个用户最多能创建10个自选股列表。
 *
 * @param {string} userId 用户ID
 * @param {string} watchlistName 自选股列表的名称
 *
 * @returns {string} 操作结果
 */
watchlistRouter.post(
  '/create',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, watchlistName } = req.body;
      const result = await createNewWatchlist(userId, watchlistName);

      return res.status(200).json({
        status: 200,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @route POST /api/watchlist/addCompany
 * @description 将公司添加到特定的自选股列表。
 *
 * @param {string} watchlistName 自选股列表ID
 * @param {string} companySymbol 公司的股票符号
 *
 * @returns {string} 操作结果
 */
watchlistRouter.post(
  '/addCompany',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { watchlistName, companySymbol } = req.body;
      const result = await addCompanyToWatchlist(watchlistName, companySymbol);

      return res.status(200).json({
        status: 200,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @route DELETE /api/watchlist/:watchlistId
 * @description 删除特定自选股列表。
 *
 * @param {string} userId 用户ID
 * @param {string} watchlistId 自选股列表ID
 *
 * @returns {string} 操作结果
 */
watchlistRouter.delete(
  '/:watchlistId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;
      const { watchlistId } = req.params;
      const result = await deleteWatchlist(userId, watchlistId);

      return res.status(200).json({
        status: 200,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @route DELETE /api/watchlist/:watchlistId/:companyId
 * @description 从特定自选股列表中删除公司。
 *
 * @param {string} userId 用户ID
 * @param {string} watchlistId 自选股列表ID
 * @param {string} companyId 公司ID
 *
 * @returns {string} 操作结果
 */
watchlistRouter.delete(
  '/:watchlistId/:companyId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;
      const { watchlistId, companyId } = req.params;
      const result = await removeCompanyFromWatchlist(
        userId,
        watchlistId,
        companyId,
      );

      return res.status(200).json({
        status: 200,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @route GET /api/watchlist/getUserWatchlists
 * @description 获取用户的所有自选股列表和其中的公司符号。
 *
 * @queryparam {string} userId 用户ID
 *
 * @returns {object} 包含自选股列表和公司符号的对象数组
 */
watchlistRouter.get(
  '/getUserWatchlists',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({
          status: 400,
          message: 'User ID is required',
        });
      }
      const result = await getUserWatchlists(userId);
      return res.status(200).json({
        status: 200,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  },
);

export default watchlistRouter;
