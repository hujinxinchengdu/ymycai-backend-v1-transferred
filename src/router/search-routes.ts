/**
 * This file contains routes that proxy the "/api/search" path.
 */

import express, { Request, Response, NextFunction } from 'express';
import { getSymbolList } from '../controllers';
import { GetCompanySearchModel } from '../models';

const router = express.Router();
router.get(
  '/:companySymbol',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companySymbol = req.params.companySymbol;

      const existingCompanies: GetCompanySearchModel = (await getSymbolList(
        companySymbol,
      )) as unknown as GetCompanySearchModel;

      return res.status(200).json(existingCompanies);
    } catch (error) {
      return next(error);
    }
  },
);

export default router;
