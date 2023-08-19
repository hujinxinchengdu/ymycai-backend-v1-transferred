export interface GetStockPricesReqParamsModel {
  company: string;
  scope: string;
  from: string;
  to: string;
}

export interface StockPriceDataPointModel {
  open: string;
  high: string;
  low: string;
  close: string;
  'adjusted close': string;
  volume: string;
  'dividend amount': string;
  'split coefficient': string;
}

export interface StockPricesModel {
  [timeSeriesKey: string]: StockPriceDataPointModel;
}

export interface MetaDataModel {
  'Company Symbol': string;
  'Last Refreshed': string;
  'Time Zone': string;
}

export interface GetStockPricesResponseModel {
  [date: string]: StockPricesModel | MetaDataModel;
}

export interface GetStockDailyPricesResponseModel
  extends GetStockPricesResponseModel {
  'Meta Data': MetaDataModel;
  'Time Series Daily': StockPricesModel;
}

export interface GetStockWeeklyPricesResponseModel
  extends GetStockPricesResponseModel {
  'Meta Data': MetaDataModel;
  'Time Series Weekly': StockPricesModel;
}

export interface GetStockMonthlyPricesResponseModel
  extends GetStockPricesResponseModel {
  'Meta Data': MetaDataModel;
  'Time Series Monthly': StockPricesModel;
}

export interface GetStockQuarterlyPricesResponseModel
  extends GetStockPricesResponseModel {
  'Meta Data': MetaDataModel;
  'Time Series Quarterly': StockPricesModel;
}

export interface GetStockYearlyPricesResponseModel
  extends GetStockPricesResponseModel {
  'Meta Data': MetaDataModel;
  'Time Series Yearly': StockPricesModel;
}

export interface TreeMapDataPointModel {
  company: string;
  priceChange: number;
  turnover: number;
}

export interface GetTreeMapDataResponseModel {
  data: TreeMapDataPointModel[];
}
