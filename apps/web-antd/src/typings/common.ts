export type IResponse<T = any> = {
  code: number;
  error: string;
  message: string;
  data: T;
};

export interface Option {
  label: string;
  value: number | string;
}

export interface PaginationType<T = any> {
  content: T[];
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface BaseFilter {
  page?: number;
  limit?: number;
  lastId?: number;
  search?: string;
}

export interface ButtonGroupItem {
  label: string;
  url: string;
  icon?: string;
  isExternal?: boolean;
  isOpenNewTab?: boolean;
}

// #/typings/common.ts hoặc nơi định nghĩa type của bạn

export interface CustomTitleConfig {
  text?: string;
  showActionButton?: boolean;
  buttonText?: string;
  buttonType?: string;
}

export interface ComponentItem {
  /** Định danh duy nhất cho từng component trên Canvas */
  id: string;
  name: string;
  group: string;

  /** Tên/Loại component (ví dụ: 'Button', 'Input', 'Card Container') */
  type: string;

  /** Nhãn hiển thị phụ (nếu có) */
  label?: string;

  /** Nội dung text hiển thị trong slot mặc định */
  slot?: string;

  /** Các props truyền trực tiếp vào component Ant Design (v-bind) */
  props: Record<string, any>;

  /** Danh sách component con (dành cho các Container như Card, Row, Col, Flex...) */
  children?: ComponentItem[];

  /**
   * CẤU HÌNH MỞ RỘNG (Bổ sung cho Card & Layout linh hoạt):
   */

  /** Hướng sắp xếp các phần tử con bên trong Container ('col' | 'row') */
  layoutDirection?: 'col' | 'row';

  /** Cấu hình tùy biến cho slot #title (dành riêng cho Card Header) */
  customTitle?: CustomTitleConfig;
}
