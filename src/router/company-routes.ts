/**
 * This file contains routes that proxy the "/api/companies" path.
 */

import express, { Request, Response, NextFunction } from 'express';
import {
  getCompanyInfoAndTags,
  getListOfCompanyInfoAndTags,
  getAllCompanies,
  getAllCompanySymbols,
  getAllTags,
  getCompanyQuoteByTag,
  createCompany,
  getAllPeerStocks,
  getPeerStockByCompanySymbol,
  getCompanyAndPeerLatestQuotes,
} from '../controllers';
import {
  GetCompanyInfoResponseModel,
  GetMultiCompanyInfosResponseModel,
  GetAllCompanyInfosResponseModel,
  GetAllCompanySymbolsResponseModel,
  GetAllTagsModel,
  GetCompaniesWithQuotesByTag,
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
 * @route GET /api/companies/company_and_peer_quote/:companySymbol
 * @description 通过公司的Symbol获取单个公司和其Peer列表上公司的最新报价信息
 *
 * @param {string} companySymbol 公司symbol
 *
 * @returns {object} 包含该公司和其Peer列表上公司的最新报价信息的对象
 */
router.get(
  '/company_and_peer_quote/:companySymbol',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companySymbol = req.params.companySymbol;

      const companyInfo = await getCompanyAndPeerLatestQuotes(companySymbol);

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

    return res.status(200).json(companies);
  } catch (error) {
    return next(error);
  }
});

/**
 * @route GET /api/companies/all_symbol?page=0&pageSize=50
 * @description 获取所有公司symbol列表
 *
 * @returns {GetAllCompanySymbolsResponseModel} 公司symbol列表json列表
 */
router.get(
  '/all_symbol',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 0;
      const pageSize = parseInt(req.query.pageSize as string) || 50;

      const company_symbols: GetAllCompanySymbolsResponseModel =
        (await getAllCompanySymbols(
          page,
          pageSize,
        )) as unknown as GetAllCompanySymbolsResponseModel;

      return res.status(200).json({
        page,
        pageSize,
        data: company_symbols,
      });
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @route GET /api/companies/all_tags
 * @description 获取所有和公司的tags列表(行业列表)
 *
 * @returns {GetAllTagsModel} tags 列表
 */
router.get(
  '/all_tags',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tags: GetAllTagsModel =
        (await getAllTags()) as unknown as GetAllTagsModel;
      return res.status(200).json(tags);
    } catch (error) {
      return next(error);
    }
  },
);

/**
 * @route GET /api/companies/companies_quotes_by_tag/:tag_id
 * @description 获取指定tag名称的所有公司及其最新报价
 *
 * @returns {GetCompaniesWithQuotesByTag} 公司及其最新报价列表
 */
router.get(
  '/companies_quotes_by_tag/:tag_id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tag_id = req.params.tag_id;
      const companiesWithQuotes: GetCompaniesWithQuotesByTag =
        (await getCompanyQuoteByTag(
          tag_id,
        )) as unknown as GetCompaniesWithQuotesByTag;
      return res.status(200).json(companiesWithQuotes);
    } catch (error) {
      return next(error);
    }
  },
);

/**

 * @route POST /api/companies/create_company
 * @description 创建新的公司
 *
 * @returns {company} 新的公司, 里面字段有company_name 和 symbol, 其他都是默认值
 */
router.post(
  '/create_company',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const symbol = req.body.symbol as string;
      const comapany_name = req.body.company_name as string;
      const company = createCompany(symbol, comapany_name);
      return res.status(200).json(company);
    } catch (error) {
      return next(error);
    }
  },
);

/*
 * @route GET /api/companies/peerstocks
 * @description 获取所有公司的PeerStock数据
 *
 * @returns {void}
 */
router.post(
  // Changed from POST to GET
  '/peerstocks',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const peerStocks = await getAllPeerStocks(); // Assuming this function returns the data you want to send
      return res.status(200).json({
        status: 200,
        data: peerStocks, // Sending back data
        message: 'PeerStock data for all companies fetched successfully.',
      });
    } catch (error) {
      console.error(`Error fetching peer stocks: ${error}`);
      return next(new Error('Failed to fetch PeerStock data.'));
    }
  },
);

/**
 * @route GET /api/companies/peerstocks/:companySymbol
 * @description 通过公司的Symbol获取该公司的PeerStock数据
 *
 * @param {string} companySymbol 公司symbol
 *
 * @returns {PeerStock} PeerStock数据
 */
router.get(
  '/peerstocks/:companySymbol',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companySymbol = req.params.companySymbol;
      const peerStockData = await getPeerStockByCompanySymbol(companySymbol);

      if (peerStockData === null) {
        return res.status(404).json({
          message: `PeerStock data for company symbol ${companySymbol} not found.`,
        });
      }

      return res.status(200).json({
        status: 200,
        message: 'PeerStock data for company symbol ${companySymbol} found.',
        data: peerStockData,
      });
    } catch (error) {
      return next(error);
    }
  },
);

export default router;
