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
router.get('/companyinfos/:companySymbol', async (req, res) => {
  try {
    const companySymbol = req.params.companySymbol;
    const companyInfo = await getCompanyInfoAndTags(companySymbol);
    res.status(200).json(companyInfo);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

/**
 * 通过公司Symbol的list来获取多个公司的信息.
 */
router.post('/companyinfos', async (req, res) => {
  try {
    const companySymbols = req.body.companySymbols; // 从请求体中获取公司符号列表
    if (!Array.isArray(companySymbols)) {
      res.status(400).json({
        error: 'Invalid input: companySymbols should be an array of strings.',
      });
      return;
    }
    const companyInfoList = await getListOfCompanyInfoAndTags(companySymbols);
    res.status(200).json(companyInfoList);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.get('/all', async (req, res) => {
  try {
    const companies = await getAllCompanies();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.get('/all_symbol', async (req, res) => {
  try {
    const company_symbols = await getAllCompanySymbols();
    res.json(company_symbols);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

export default router;
