import type { Option } from "#/typings/common";

export const mapOptions = (data: any): Option[] => {
  return Object.keys(data).map((key) => ({
    label: key, // Tên hiển thị (ví dụ: 'BasicLayout', 'IFrameView')
    value: key, // Giá trị lưu trữ
  }))
}

export const preventEnter = (e: KeyboardEvent) => {
  e.key === 'Enter' && e.stopPropagation(); // Chặn submit form khi nhấn enter trong ô input
}
