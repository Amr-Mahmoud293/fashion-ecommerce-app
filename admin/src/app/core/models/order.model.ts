import { IShipping } from './shipping.model';

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'received'
  | 'cancelled'
  | 'rejected'
  | 'paid';

export interface IOrderProductItem {
  _id?: string;
  name: string;
  price: number;
  imageURL?: string;
}

export interface IOrderProduct {
  product: IOrderProductItem | string;
  quantity: number;
  price: number;
}

export interface IOrderUser {
  _id: string;
  name: string;
  email: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  user: string | IOrderUser;
  products: IOrderProduct[];
  totalPrice: number;
  shippingAddress: string;
  shipping: string | IShipping;
  shippingFee: number;
  status: OrderStatus;
  isDeleted?: boolean;
  purchaseAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateOrderPayload {
  shippingAddress: string;
  shippingId: string;
}

export interface IOrderRes {
  message: string;
  data: IOrder;
}

export interface IOrdersRes {
  message: string;
  data: IOrder[];
}

export interface IAdminOrdersRes {
  message: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  results: IOrder[];
}

