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
