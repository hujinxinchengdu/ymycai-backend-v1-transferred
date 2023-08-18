import axios from 'axios';

const requestQueue: (() => Promise<void>)[] = [];
const REQUESTS_PER_MINUTE = 750;
const REQUEST_INTERVAL = 60000 / REQUESTS_PER_MINUTE;

setInterval(async () => {
  if (requestQueue.length > 0) {
    console.log(requestQueue.length);
    const requestFn = requestQueue.shift();
    if (requestFn) {
      try {
        await requestFn();
      } catch (error) {
        console.error('Error processing request:', error.message);
      }
    }
  }
}, REQUEST_INTERVAL);

async function queueRequest(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const requestFn = async () => {
      let attempts = 3; // 设置重试次数
      let lastError;
      while (attempts > 0) {
        try {
          const response = await axios.get(url);
          resolve(response);
          return; // 成功后返回
        } catch (error) {
          lastError = error; // 记录最后一次的错误
          attempts--;
        }
      }
      reject(lastError); // 如果重试次数用完，抛出最后一次的错误
    };

    requestQueue.push(requestFn);
  });
}

export { queueRequest };

// 使用queueRequest方法，例如:
// const responseIncomeStatement = await queueRequest(incomeStatementApiUrl);
