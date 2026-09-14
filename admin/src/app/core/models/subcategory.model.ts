import { ICategory } from "./category.model";

export interface ISubcategory {
    _id: string;
    name: string;
    slug: string;
    category: ICategory;
}

export interface ISubcategoriesRes {
    message: string,
    data: ISubcategory[]
}

export interface ISubcategoryRes {
    message: string,
    data: ISubcategory
}