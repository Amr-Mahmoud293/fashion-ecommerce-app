export interface ICategory {
    _id: string;
    name: string;
    slug: string;
}

export interface ICategoriesRes {
    message: string,
    data: ICategory[]
}

export interface ICategoryRes {
    message: string,
    data: ICategory
}