<script setup lang="ts">
import { computed } from 'vue';
import {
  Button,
  Card,
  Input,
  message,
  Radio,
  Select,
  Switch,
  Tag,
  Typography,
} from 'ant-design-vue';
import type { ComponentItem } from '#/typings/common';

const props = defineProps<{
  canvasList: ComponentItem[];
  selectedId: null | string;
}>();

const { Text } = Typography;

// 1. Tìm item được chọn trong cây cấu trúc đệ quy
const findSelectedItem = (
  items: ComponentItem[],
  id: string,
): ComponentItem | null => {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children && item.children.length > 0) {
      const found = findSelectedItem(item.children, id);
      if (found) return found;
    }
  }
  return null;
};

const selectedItem = computed(() => {
  if (!props.selectedId) return null;
  return findSelectedItem(props.canvasList, props.selectedId);
});

const ensureStyleObject = () => {
  if (selectedItem.value?.props && !selectedItem.value.props.style) {
    selectedItem.value.props.style = {};
  }
};

const ensureCustomTitleObject = () => {
  if (selectedItem.value && !selectedItem.value.customTitle) {
    selectedItem.value.customTitle = {
      text: 'Tiêu đề Card',
      showActionButton: true,
      buttonText: 'Hành động',
      buttonType: 'default',
    };
  }
};

// 2. Hàm đệ quy xuất mã nguồn .vue
const renderNodeToVue = (node: ComponentItem, indentLevel = 2): string => {
  const indent = ' '.repeat(indentLevel * 2);
  const tagName = `a-${node.type.toLowerCase().replaceAll(/\s+/g, '-').replace('.', '-')}`;

  // Chuẩn hóa props
  const propsStr = Object.entries(node.props || {})
    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => {
      if (typeof v === 'string') return `${k}="${v}"`;
      if (typeof v === 'boolean') return v ? k : `:${k}="false"`;
      if (typeof v === 'object') return `:${k}='${JSON.stringify(v)}'`;
      return `:${k}="${v}"`;
    })
    .join(' ');

  const hasProps = propsStr ? ` ${propsStr}` : '';

  // Xử lý riêng Card với customTitle
  if (node.type === 'Card Container' || node.type === 'Card') {
    const layoutClass =
      node.layoutDirection === 'row'
        ? 'flex flex-row items-center gap-3'
        : 'flex flex-col gap-3';
    let titleSlotCode = '';
    if (node.customTitle) {
      const btnCode = node.customTitle.showActionButton
        ? `\n${indent}    <a-button type="${node.customTitle.buttonType || 'default'}">${node.customTitle.buttonText}</a-button>`
        : '';
      titleSlotCode = `${indent}  <template #title>\n${indent}    <div class="flex items-center justify-between">\n${indent}      <span>${node.customTitle.text}</span>${btnCode}\n${indent}    </div>\n${indent}  </template>\n`;
    }

    const childrenCode = Array.isArray(node.children)
      ? node.children
          .map((child) => renderNodeToVue(child, indentLevel + 2))
          .join('\n')
      : '';

    return `${indent}<a-card${hasProps}>\n${titleSlotCode}${indent}  <div class="${layoutClass}">\n${childrenCode}\n${indent}  </div>\n${indent}</a-card>`;
  }

  // TRƯỜNG HỢP CONTAINER CHUNG: Có children
  if (Array.isArray(node.children) && node.children.length > 0) {
    const childrenCode = node.children
      .map((child) => renderNodeToVue(child, indentLevel + 1))
      .join('\n');
    return `${indent}<${tagName}${hasProps}>\n${childrenCode}\n${indent}</${tagName}>`;
  }

  // TRƯỜNG HỢP COMPONENT ĐƠN LẺ
  const content = node.props?.label || node.slot || '';
  if (content) {
    return `${indent}<${tagName}${hasProps}>${content}</${tagName}>`;
  }

  return `${indent}<${tagName}${hasProps} />`;
};

// Xuất file .vue
const exportVueFile = () => {
  if (props.canvasList.length === 0) return;

  const templateCode = props.canvasList
    .map((node) => renderNodeToVue(node, 2))
    .join('\n');

  // Tách thẻ đóng script để tránh lỗi Linter / Parser
  const scriptTagClose = '</' + 'script>';

  const fullVueCode = `<template>
  <div class="p-6 space-y-4">
${templateCode}
  </div>
</template>

<script setup lang="ts">
// Code sinh tự động từ Low-Code Page Builder
${scriptTagClose}`;

  const blob = new Blob([fullVueCode], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `GeneratedPage_${Date.now()}.vue`;
  link.click();
  URL.revokeObjectURL(url);

  message.success('Xuất file .vue thành công!');
};
</script>

<template>
  <Card
    title="Cấu hình Component"
    class="w-1/4 h-full flex flex-col"
    :body-style="{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100% - 57px)',
      padding: '16px',
    }"
  >
    <div class="flex-1 overflow-y-auto pr-1 space-y-4">
      <div v-if="selectedItem" class="space-y-4">
        <!-- HEADER TRẠNG THÁI -->
        <div class="flex items-center justify-between pb-2 border-b">
          <span class="font-bold text-blue-600 text-sm">{{
            selectedItem.type
          }}</span>
          <Tag color="cyan" class="mr-0 text-[10px]">
ID: {{ selectedItem.id }}
</Tag>
        </div>

        <!-- CẤU HÌNH ĐẶC THÙ CHO CARD CONTAINER -->
        <div
          v-if="
            selectedItem.type === 'Card Container' ||
            selectedItem.type === 'Card'
          "
          class="space-y-3"
        >
          <Text
            type="secondary"
            strong
            class="text-xs uppercase tracking-wider block"
          >
            Cấu hình Layout & Slot Card
          </Text>

          <!-- Đổi chiều Layout bên trong Card -->
          <div>
            <label class="block text-xs mb-1 font-medium">Hướng sắp xếp con (Layout Direction):</label>
            <Radio.Group
              v-model:value="selectedItem.layoutDirection"
              option-type="button"
              button-style="solid"
              size="small"
              class="w-full"
            >
              <Radio.Button value="col" class="w-1/2 text-center">
Dọc (Column)
</Radio.Button>
              <Radio.Button value="row" class="w-1/2 text-center">
Ngang (Row)
</Radio.Button>
            </Radio.Group>
          </div>

          <!-- Cấu hình Custom Header Title Slot -->
          <div class="pt-2 border-t space-y-2">
            <label class="block text-xs font-medium">Tiêu đề Card (Slot #title):</label>
            <Input
              :value="selectedItem.customTitle?.text"
              @update:value="
                (val: any) => {
                  if (!selectedItem || !selectedItem.customTitle) return;
                  ensureCustomTitleObject();
                  selectedItem.customTitle!.text = val;
                }
              "
              placeholder="Nhập tiêu đề..."
            />

            <div class="flex items-center justify-between pt-1">
              <span class="text-xs">Hiển thị nút ở góc phải Header:</span>
              <Switch
                :checked="selectedItem.customTitle?.showActionButton"
                @update:checked="
                  (val: any) => {
                    if (!selectedItem || !selectedItem.customTitle) return;
                    ensureCustomTitleObject();
                    selectedItem.customTitle.showActionButton = val;
                  }
                "
                size="small"
              />
            </div>

            <div
              v-if="selectedItem.customTitle?.showActionButton"
              class="space-y-2 pl-2 border-l-2 border-blue-200"
            >
              <Input
                :value="selectedItem.customTitle?.buttonText"
                @update:value="
                  (val) => {
                    if (!selectedItem || !selectedItem.customTitle) return;
                    ensureCustomTitleObject();
                    selectedItem.customTitle!.buttonText = val;
                  }
                "
                placeholder="Tên nút bấm..."
                size="small"
              />
              <Select
                :value="selectedItem.customTitle?.buttonType"
                @change="
                  (val) => {
                    if (!selectedItem || !selectedItem.customTitle) return;
                    ensureCustomTitleObject();
                    selectedItem.customTitle!.buttonType = val as string;
                  }
                "
                class="w-full"
                size="small"
              >
                <Select.Option value="primary">Primary</Select.Option>
                <Select.Option value="default">Default</Select.Option>
                <Select.Option value="dashed">Dashed</Select.Option>
              </Select>
            </div>
          </div>
        </div>

        <!-- 1. NỘI DUNG & TEXT (Cho Input, Button...) -->
        <div
          v-if="
            selectedItem.props?.label !== undefined ||
            selectedItem.slot !== undefined ||
            selectedItem.props?.placeholder !== undefined
          "
          class="space-y-3 pt-2 border-t"
        >
          <Text
            type="secondary"
            strong
            class="text-xs uppercase tracking-wider block"
          >
            1. Nội dung & Text
          </Text>

          <div v-if="selectedItem.props?.label !== undefined">
            <label class="block text-xs mb-1">Label (Nội dung):</label>
            <Input
              v-model:value="selectedItem.props.label"
              placeholder="Nhập nhãn..."
            />
          </div>

          <div v-if="selectedItem.slot !== undefined">
            <label class="block text-xs mb-1">Slot Mặc định (Text):</label>
            <Input.TextArea v-model:value="selectedItem.slot" :rows="2" />
          </div>

          <div v-if="selectedItem.props?.placeholder !== undefined">
            <label class="block text-xs mb-1">Placeholder:</label>
            <Input v-model:value="selectedItem.props.placeholder" />
          </div>
        </div>

        <!-- 2. KÍCH THƯỚC & STYLE -->
        <div class="space-y-3 pt-2 border-t">
          <Text
            type="secondary"
            strong
            class="text-xs uppercase tracking-wider block"
          >
            2. Kích thước & Style (Width / Flex)
          </Text>

          <div>
            <label class="block text-xs mb-1">Chiều rộng (Width):</label>
            <Input
              :value="selectedItem.props?.style?.width"
              @update:value="
                (val) => {
                  if (!selectedItem || !selectedItem.customTitle) return;
                  ensureStyleObject();
                  selectedItem.props.style.width = val;
                }
              "
              placeholder="vd: 200px, 100%, flex-1..."
              allow-clear
            />
          </div>

          <div>
            <label class="block text-xs mb-1 font-medium">Tự co giãn trong Flex:</label>
            <Select
              :value="selectedItem.props?.style?.flex"
              @change="
                (val) => {
                  if (!selectedItem || !selectedItem.customTitle) return;
                  ensureStyleObject();
                  selectedItem.props.style.flex = val;
                }
              "
              class="w-full"
              allow-clear
              placeholder="Chọn kiểu flex"
            >
              <Select.Option value="1 1 auto">
Flex: 1 (Lấp đầy khoảng trống)
</Select.Option>
              <Select.Option value="0 0 auto">Cố định theo Width</Select.Option>
              <Select.Option value="none">None</Select.Option>
            </Select>
          </div>
        </div>

        <!-- 3. TRẠNG THÁI COMPONENT -->
        <div
          v-if="
            selectedItem.props?.disabled !== undefined ||
            selectedItem.props?.loading !== undefined ||
            selectedItem.props?.allowClear !== undefined
          "
          class="space-y-3 pt-2 border-t"
        >
          <Text
            type="secondary"
            strong
            class="text-xs uppercase tracking-wider block"
          >
            3. Trạng thái Component
          </Text>

          <div
            class="flex items-center justify-between"
            v-if="selectedItem.props?.disabled !== undefined"
          >
            <span class="text-xs">Vô hiệu hóa (Disabled):</span>
            <Switch
              v-model:checked="selectedItem.props.disabled"
              size="small"
            />
          </div>

          <div
            class="flex items-center justify-between"
            v-if="selectedItem.props?.loading !== undefined"
          >
            <span class="text-xs">Trạng thái Loading:</span>
            <Switch v-model:checked="selectedItem.props.loading" size="small" />
          </div>

          <div
            class="flex items-center justify-between"
            v-if="selectedItem.props?.allowClear !== undefined"
          >
            <span class="text-xs">Nút xóa nhanh (Allow Clear):</span>
            <Switch
              v-model:checked="selectedItem.props.allowClear"
              size="small"
            />
          </div>
        </div>

        <!-- 4. TAILWIND CLASS -->
        <div class="space-y-3 pt-2 border-t">
          <Text
            type="secondary"
            strong
            class="text-xs uppercase tracking-wider block"
          >
            4. CSS Class Tailwind
          </Text>
          <div>
            <Input
              v-model:value="selectedItem.props.class"
              placeholder="w-full mt-2..."
            />
          </div>
        </div>
      </div>

      <div v-else class="text-gray-400 text-sm italic py-12 text-center">
        Chưa chọn component nào.<br />Hãy bấm vào 1 item trên Canvas để chỉnh
        sửa.
      </div>
    </div>

    <!-- NÚT XUẤT CODE -->
    <div class="pt-3 mt-2 border-t shrink-0">
      <Button
        type="primary"
        block
        size="large"
        @click="exportVueFile"
        :disabled="!canvasList.length"
      >
        📥 Xuất ra file .vue
      </Button>
    </div>
  </Card>
</template>
