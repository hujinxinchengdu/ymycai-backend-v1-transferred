import cron from 'node-cron';
import {
  saveAllMarketNewData,
  deleteOldCompanyQuoteData,
} from '../controllers';

export function scheduleDailyCall() {
  try {
    cron.schedule(
      '0 0 * * *',
      async () => {
        await saveAllMarketNewData();
        console.log('API call successful!');
      },
      {
        timezone: 'Asia/Shanghai', // 设置时区，根据你的需要修改
      },
    );
  } catch (error) {
    console.error('Error fetching last market data:', error.message);
    throw error;
  }
}

// 计划删除老的公司行情数据的任务
cron.schedule('0 3 * * *', deleteOldCompanyQuoteData);
