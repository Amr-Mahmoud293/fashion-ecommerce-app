export interface IFaq {
  _id: string;
  question: string;
  answer: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IFaqsRes {
  message: string;
  results: IFaq[];
  totalPages: number;
  page: number;
  limit: number;
  total: number;
}

export interface IFaqRes {
  message: string;
  data: IFaq;
}

export interface IFaqQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}
