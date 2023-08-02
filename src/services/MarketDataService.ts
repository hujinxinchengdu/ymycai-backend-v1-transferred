import axios, { AxiosResponse } from 'axios';
import { MarketData } from '../models';

// 定义获取市场数据的函数
export async function getMarketData(): Promise<MarketData> {
  try {
    // 发送API请求，获取市场数据
    const response = await axios.get<any>('https://api.example.com/marketdata');
    console.log(response);
    const tempdate = response.data;
    console.log(tempdate);
    // 提取市场数据
    const marketData = new MarketData();

    // 返回市场数据
    return marketData;
  } catch (error) {
    // 处理错误
    console.error('Error fetching market data:', error.message);
    throw error;
  }
}
