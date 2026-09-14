export interface IUser {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    gender?: 'male' | 'female';
    phone?: string;
    age?: number;
    addresses?: string[];
    status: 'blocked' | 'active';
    updatedAt?: string;
    createdAt?: string;
}

export interface IUsersRes {
    message: string;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    results: IUser[];
}

