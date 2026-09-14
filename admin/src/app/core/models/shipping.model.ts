export interface IShipping {
  _id: string;
  city: string;
  cost: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IShippingRes {
  message: string;
  data: IShipping[];
}

export interface ISingleShippingRes {
  message: string;
  data: IShipping;
}
