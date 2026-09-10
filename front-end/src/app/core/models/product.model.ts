import { ICategory } from "./category.model";
import { ISubcategory } from "./subcategory.model";

export interface IProduct {
    _id: string;
    name: string;
    description: string;
    price: number;
    imageURL: string;
    category: ICategory;
    subCategory: ISubcategory;
    slug: string;
    isTop: boolean;
    isNewArrival: boolean;
}

export interface IProductsRes {
    message: string;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    results: IProduct[];
}

export interface IProductRes {
    message: string,
    data: IProduct
}
export interface IProducts {
    message: string,
    data: IProduct[]
}

export interface IProductQueryParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    category?: string;
    subCategory?: string;
    minPrice?: number;
    maxPrice?: number;
    isTop?: boolean;
    isNewArrival?: boolean;
    search?: string;
}