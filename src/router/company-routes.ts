/**
 * This file contains routes that proxy the "/api/companies" path.
 */

import express from 'express';
import {
  getCompanyInfoAndTags,
  getListOfCompanyInfoAndTags,
  getAllCompanies,
  getAllCompanySymbols,
} from '../controllers';

const router = express.Router();

/**
 * 通过公司的Symbol获取单个公司的信息
 */
router.get('/company_infos/:companySymbol', async (req, res, next) => {
  try {
    const companySymbol = req.params.companySymbol;
    const companyInfo = await getCompanyInfoAndTags(companySymbol);
    return res.status(200).json(companyInfo);
  } catch (error) {
    return next(error);
  }
});

/**
 * 通过公司Symbol的list来获取多个公司的信息.
 */
router.post('/company_infos', async (req, res, next) => {
  try {
    const companySymbols = req.body.companySymbols; // 从请求体中获取公司符号列表
    if (!Array.isArray(companySymbols)) {
      return res.status(400).json({
        error: 'Invalid input: companySymbols should be an array of strings.',
      });
    }
    const companyInfoList = await getListOfCompanyInfoAndTags(companySymbols);
    return res.status(200).json(companyInfoList);
  } catch (error) {
    return next(error);
  }
});

router.get('/all', async (req, res, next) => {
  try {
    const companies = await getAllCompanies();
    res.json(companies);
  } catch (error) {
    return next(error);
  }
});

router.get('/all_symbol', async (req, res, next) => {
  try {
    const company_symbols = await getAllCompanySymbols();
    res.json(company_symbols);
  } catch (error) {
    return next(error);
  }
});

export default router;
