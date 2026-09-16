export type IResponse<T = any> = {
  code: number
  error: string
  message: string;
  data: T;
}

export interface Option {
  label: string
  value: number | string
}

export interface PaginationType<T = any> {
  content: T[]
  page: {
    size: number
    totalElements: number
    totalPages: number
  }
}


export interface BaseFilter {
  page?: number
  limit?: number
  lastId?: number
  search?: string
}
