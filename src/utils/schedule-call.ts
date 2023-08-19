import cron from 'node-cron';
import { saveMarketNewData } from '../controllers';

export function scheduleDailyCall() {
  try {
    cron.schedule(
      '0 0 * * *',
      async () => {
        await saveMarketNewData();
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
