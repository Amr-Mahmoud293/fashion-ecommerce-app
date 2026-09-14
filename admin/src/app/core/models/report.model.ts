export interface ITopProduct {
  _id?: string;
  productId: string;
  name: string;
  price: number;
  imageURL?: string;
  totalRevenue: number;
  totalQuantity: number;
  totalOrders: number;
}

export interface ITopUser {
  _id?: string;
  userId: string;
  name: string;
  email: string;
  totalSpent: number;
  totalQuantity: number;
  totalOrders: number;
}

export interface IYearlyReport {
  year: number;
  totalRevenue: number;
  totalQuantity: number;
  totalPurchases: number;
}

export interface IMonthlyReport {
  year: number;
  month: number;
  totalRevenue: number;
  totalQuantity: number;
  totalPurchases: number;
}

export interface IWeeklyReport {
  weekStart: string;
  totalRevenue: number;
  totalQuantity: number;
  totalPurchases: number;
}

export interface ISalesSummary {
  topProducts: ITopProduct[];
  topUsers: ITopUser[];
  yearly: IYearlyReport[];
  monthly: IMonthlyReport[];
  weekly: IWeeklyReport[];
}

export interface ISalesReportRes {
  message: string;
  data: ISalesSummary[];
}
