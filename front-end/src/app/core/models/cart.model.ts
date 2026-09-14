export interface IProductCartItem {
  _id: string;
  name: string;
  price: number;
  imageURL?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  stock?: number;
}

export interface ICartItem {
  product: IProductCartItem;
  quantity: number;
  priceAtAddition: number;
}

export interface ICartChangedItem {
  product: IProductCartItem;
  oldQuantity: number;
  newQuantity: number;
  oldPrice: number;
  newPrice: number;
  priceChanged: boolean;
  quantityChanged: boolean;
}

export interface IFailedCartItem {
  product: IProductCartItem | null;
  reason: string;
}

export interface ICart {
  _id?: string;
  user?: string;
  items: ICartItem[];
  changedItems: ICartChangedItem[];
  totalCartPrice: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ILocalCartItem {
  productId: string;
  quantity: number;
  price?: number;
  product?: IProductCartItem;
}

export interface ICartRes {
  message: string;
  hasChanges?: boolean;
  failedItems?: IFailedCartItem[] | { unavailable: IFailedCartItem[]; notFound: any[] };
  data: ICart;
}
