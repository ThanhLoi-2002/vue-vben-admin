export type IResponse<T = any> = {
  code: number
  error: string
  message: string;
  data: T;
}
