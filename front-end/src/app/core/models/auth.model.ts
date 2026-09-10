import { IUser } from "./user.model";

export interface ILoginData {
    email: string,
    password: string,
}

export interface IRegisterData {
    name: string;
    email: string;
    password: string;
    gender?: 'male' | 'female';
    phone?: string;
    age?: number;
}

export interface IAuthRes {
    message: string,
    token: string,
    user: IUser,
}

export interface ITokenPayload {
    id: string;
    name: string;
    role: string;
    iat: number;
    exp: number;
}