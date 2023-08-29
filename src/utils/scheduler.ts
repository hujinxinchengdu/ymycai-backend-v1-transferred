import cron from 'node-cron';
import {
  deleteOldCompanyQuoteData,
  updateAllCompanyQuoteData,
} from '../controllers';

// Schedule the task to run every day at 3am
cron.schedule('0 3 * * *', deleteOldCompanyQuoteData);

// Schedule the task to run every 15 minutes
cron.schedule('*/15 * * * *', updateAllCompanyQuoteData);
