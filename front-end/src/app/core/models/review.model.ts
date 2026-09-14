export interface IReviewUser {
  _id: string;
  name: string;
  email?: string;
}

export interface IReview {
  _id: string;
  user: IReviewUser | string;
  rating: number;
  comment: string;
  isApproved?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateReviewPayload {
  rating: number;
  comment: string;
}

export interface IUpdateReviewPayload {
  rating?: number;
  comment?: string;
}

export interface IReviewsRes {
  message: string;
  results: IReview[];
  totalPages: number;
  page: number;
  limit: number;
  total: number;
}

export interface IReviewRes {
  message: string;
  data: IReview | null;
}

export interface IReviewQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}
