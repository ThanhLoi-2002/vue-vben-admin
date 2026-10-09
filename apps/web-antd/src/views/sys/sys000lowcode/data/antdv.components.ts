// components.config.ts
import { markRaw } from 'vue';
import { Button, Card, Input } from 'ant-design-vue';

export interface ComponentConfig {
  name: string;
  group: string;
  component: any;
  props?: Record<string, any>;
  slot?: string;
  // Cấu hình linh hoạt cho layout hoặc title slot
  layoutDirection?: 'col' | 'row';
  customTitle?: {
    text?: string;
    showActionButton?: boolean;
    buttonText?: string;
    buttonType?: string;
  };
}

// 1. Danh sách component rút gọn (Card, Input, Button)
export const rawComponents: ComponentConfig[] = [
  // General
  {
    name: 'Button',
    group: 'General',
    component: Button,
    props: { type: 'primary' },
    slot: 'Primary Button',
  },

  // Data Entry
  {
    name: 'Input',
    group: 'Data Entry',
    component: Input,
    props: { placeholder: 'Nhập văn bản...', allowClear: true },
  },

  // Card (Bao bọc Input & Button)
  {
    name: 'Card',
    group: 'Data Display',
    component: Card,
    props: {
      title: 'Cấu trúc Menu Hệ thống',
      size: 'small',
      bordered: true,
    },
    // Chế độ sắp xếp các component con bên trong Card ('col' hoặc 'row')
    layoutDirection: 'col',
    // Cấu hình slot #title tùy biến
    customTitle: {
      text: 'Cấu trúc Menu Hệ thống',
      showActionButton: true,
      buttonText: 'Bật chế độ kéo thả',
      buttonType: 'default',
    },
  },
];

// 2. Danh sách tối ưu markRaw dùng cho Sidebar (Kéo thả)
export const antdComponents = rawComponents
  .map((item) => ({
    ...item,
    component: markRaw(item.component),
    type: item.name,
  }))
  .toSorted((a, b) => a.name.localeCompare(b.name));

const mapResult: Record<string, any> = {};
for (const item of rawComponents) {
  mapResult[item.name] = markRaw(item.component);
}

export const componentMap = mapResult;
