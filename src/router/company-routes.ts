/**
 * This file contains routes that proxy the "/api/companies" path.
 */

import express, { Request, Response, NextFunction } from 'express';
import {
  getCompanyInfoAndTags,
  getListOfCompanyInfoAndTags,
  getAllCompanies,
  getAllCompanySymbols,
} from '../controllers';
import {
  GetCompanyInfoResponseModel,
  GetMultiCompanyInfosResponseModel,
  GetAllCompanyInfosResponseModel,
  GetAllCompanySymbolsResponseModel,
} from '../models';

const router = express.Router();

/**
 * @route GET /api/companies/company_infos/:companySymbol
 * @description 通过公司的Symbol获取单个公司的信息
 *
 * @param {string} companySymbol 公司symbol
 *
 * @returns {GetCompanyInfoResponseModel} 该公司信息
 */
router.get(
  '/company_infos/:companySymbol',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companySymbol = req.params.companySymbol;

      const companyInfo: GetCompanyInfoResponseModel =
        (await getCompanyInfoAndTags(
          companySymbol,
        )) as unknown as GetCompanyInfoResponseModel;

      return res.status(200).json(companyInfo);
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @route POST /api/companies/company_infos
 * @description 通过包含多个公司symbol的list来获取多个公司的信息
 *
 * @param { GetCompanyInfosReqBodyModel} req.body 包含公司symbol列表
 *
 * @returns {GetMultiCompanyInfosResponseModel} 公司信息列表
 */
router.post(
  '/company_infos',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companySymbols = req.body.companySymbols; // 从请求体中获取公司符号列表
      if (!Array.isArray(companySymbols)) {
        return res.status(400).json({
          error: 'Invalid input: companySymbols should be an array of strings.',
        });
      }

      const companyInfoList: GetMultiCompanyInfosResponseModel =
        (await getListOfCompanyInfoAndTags(
          companySymbols,
        )) as unknown as GetMultiCompanyInfosResponseModel;

      return res.status(200).json(companyInfoList);
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @route GET /api/companies/all
 * @description 获取所有公司信息
 *
 * @returns {GetAllCompanyInfosResponseModel} 公司信息列表
 */
router.get('/all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companies: GetAllCompanyInfosResponseModel =
      (await getAllCompanies()) as unknown as GetAllCompanyInfosResponseModel;

    return res.json(companies);
  } catch (error) {
    return next(error);
  }
});

/**
 * @route GET /api/companies/all_symbol
 * @description 获取所有公司symbol列表
 *
 * @returns {GetAllCompanySymbolsResponseModel} 公司symbol列表
 */
router.get(
  '/all_symbol',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const company_symbols: GetAllCompanySymbolsResponseModel =
        (await getAllCompanySymbols()) as unknown as GetAllCompanySymbolsResponseModel;

      return res.json(company_symbols);
    } catch (error) {
      return next(error);
    }
  },
);

export default router;
