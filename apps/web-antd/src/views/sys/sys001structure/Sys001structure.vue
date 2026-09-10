<script lang="ts" setup>
import type { VbenFormSchema } from '#/adapter/form.js';
import type { Option } from '#/typings/common.js';

import { computed, onMounted, ref } from 'vue';

import { Page, Sys001structureForm } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Button, Card } from 'ant-design-vue';

import { useSys001structureStore } from '#/store';
import { MenuType } from '#/typings/enum.js';
import { layoutMap } from '#/utils/constant.js';
import { mapOptions, preventEnter } from '#/utils/helper.js';

import TreeNodeItem from './components/TreeNodeItem.vue';
import type { Recordable, Sys001structure } from '@vben/types';

const sys001structureStore = useSys001structureStore();
const sys001structureFormRef = ref();

// Mảng chứa toàn bộ cấu trúc tree ở cấp root
const treeData = ref<Sys001structure[]>([]);
const selectedId = ref<number | undefined>(undefined);

// State bật/tắt chế độ kéo thả di chuyển node
const isReorderMode = ref<boolean>(false);

function generateTreeOptions(nodes: Sys001structure[], level = 0): Option[] {
  let options: Option[] = [];

  nodes.forEach((node) => {
    // Tạo khoảng lùi và tiền tố phân cấp dựa vào độ sâu (level)
    const indent = level > 0 ? '|-- '.repeat(level) : '';

    // Ghép nhãn theo cấu trúc: (|-- * type) + code
    const label = `${indent}${node.code}`;

    // Push node hiện tại vào mảng options
    options.push({
      label,
      value: node.id,
    });

    // Nếu node có children, gọi đệ quy tiếp tục duyệt sâu xuống và tăng level lên 1
    if (node.children && node.children.length > 0) {
      options = options.concat(generateTreeOptions(node.children, level + 1));
    }
  });

  return options;
}

const parentOptions = computed(() => {
  if (treeData.value.length > 0) {
    return generateTreeOptions(treeData.value);
  } else return [];
});

const menuTypeOptions = mapOptions(MenuType);
const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      fieldName: 'pid',
      component: 'Select',
      label: 'Parent',
      rules: 'required',
      defaultValue: 1,
      componentProps: {
        showSearch: true, // Bật tính năng tìm kiếm / gõ lọc
        optionFilterProp: 'label', // Định nghĩa tìm kiếm dựa theo chữ hiển thị (label) của option
        options: parentOptions,
      },
    },
    {
      fieldName: 'code',
      component: 'Input',
      label: 'Code',
      rules: 'required',
    },
    {
      fieldName: 'name',
      component: 'Input',
      label: 'Name',
      rules: 'required',
    },
    {
      fieldName: 'path',
      component: 'Input',
      label: 'Path',
      rules: 'required',
    },
    {
      fieldName: 'component',
      component: 'Input',
      label: 'Component',
      rules: 'required',
    },
    {
      fieldName: 'icon',
      component: 'Input',
      label: 'Icon',
    },
    {
      fieldName: 'layout',
      component: 'Select',
      label: 'Layout',
      componentProps: {
        placeholder: 'Please select or search layout',
        allowClear: true, // Cho phép bỏ trống / xóa giá trị đã chọn
        showSearch: true, // Bật tính năng tìm kiếm / gõ lọc
        optionFilterProp: 'label', // Định nghĩa tìm kiếm dựa theo chữ hiển thị (label) của option
        options: mapOptions(layoutMap),
      },
    },
    {
      fieldName: 'authCode',
      component: 'Select',
      componentProps: {
        placeholder: 'Please select or search layout',
        onKeydown: preventEnter,
        allowClear: true, // Cho phép bỏ trống / xóa giá trị đã chọn
        showSearch: true, // Bật tính năng tìm kiếm / gõ lọc
        optionFilterProp: 'label', // Định nghĩa tìm kiếm dựa theo chữ hiển thị (label) của option
        mode: 'tags',
        options: [
          { label: 'Grid Layout', value: 'grid' },
          { label: 'Flex Layout', value: 'flex' },
          { label: 'Absolute Layout', value: 'absolute' },
        ],
      },
      label: 'Auth code',
    },
    {
      fieldName: 'description',
      component: 'Textarea',
      label: 'Description',
      componentProps: {
        rows: 2,
        onKeydown: preventEnter,
      },
    },
    {
      fieldName: 'menuType',
      component: 'RadioGroup',
      label: 'Type',
      defaultValue: menuTypeOptions[0]?.value,
      componentProps: {
        optionType: 'button',
        buttonStyle: 'solid',
        options: menuTypeOptions,
      },
    },
    {
      fieldName: 'stt',
      component: 'RadioGroup',
      label: 'Status',
      defaultValue: 1,
      componentProps: {
        options: [
          { label: 'Active', value: 1 },
          { label: 'Disable', value: 0 },
          { label: 'Delete', value: -1 },
        ],
      },
    },
  ];
});

const changeReorderMode = () => {
  isReorderMode.value = !isReorderMode.value
  if(isReorderMode.value) resetForm()
}
const getAllStructures = async () => {
  const res = await sys001structureStore.getAllStructures();
  if (res) {
    // Đảm bảo dữ liệu luôn là mảng
    treeData.value = Array.isArray(res) ? res : [res];
  }
};

const selectNode = (node: Sys001structure) => {
  sys001structureFormRef.value.selectNode(node);
  sys001structureFormRef.value.clearValidation()
  selectedId.value = node.id;
};

const resetForm = () => {
  selectedId.value = undefined;
  sys001structureFormRef.value.resetForm();
};

const submit = async (data: Recordable<Sys001structure>) => {
  const result = await sys001structureStore.createOrUpdateNode(data, selectedId.value);

  if (result) await getAllStructures();
};

onMounted(async () => {
  await getAllStructures();
});
</script>

<template>
  <Page title="TreeView Demo" description="Sử dụng Ant Design Tree trong Vben Admin">
    <div class="flex flex-col lg:flex-row space-y-2">
      <div class="mr-4 w-full lg:w-3/5">
        <Card>
          <!-- Sử dụng slot #title để tùy biến tiêu đề và đặt nút sang bên phải -->
          <template #title>
            <div class="flex items-center justify-between">
              <span>Cấu trúc Menu Hệ thống</span>
              <Button
                @click="changeReorderMode"
                :type="isReorderMode ? 'primary' : 'default'"
                :class="
                  isReorderMode &&
                  '!bg-amber-500 !border-amber-500 hover:!bg-amber-600 hover:!border-amber-600'
                "
              >
                <template #icon>
                  <IconifyIcon icon="basil:sort-outline" class="w-5 h-5" />
                </template>
                {{ isReorderMode ? 'Đang bật chế độ kéo thả' : 'Bật chế độ kéo thả' }}
              </Button>
            </div>
          </template>
          <!-- <div class="p-4 rounded-xl shadow-sm border w-full"> -->
          <!-- Gọi component con đệ quy để hiển thị danh sách -->
          <TreeNodeItem
            :nodes="treeData"
            :is-reorder-mode="isReorderMode"
            :selected-id="selectedId"
            @update:nodes="(newNodes) => (treeData = newNodes)"
            @select:node="selectNode"
          />
          <!-- </div> -->
        </Card>
      </div>
      <div class="w-full lg:w-2/5">
        <Card>
          <!-- Sử dụng slot #title để tùy biến tiêu đề và đặt nút sang bên phải -->
          <template #title>
            <div class="flex items-center justify-between">
              <span>{{ selectedId ? 'Update' : 'Add' }}</span>
              <Button v-if="selectedId" @click="resetForm" type="primary">
                <template #icon>
                  <IconifyIcon icon="carbon:reset" class="w-5 h-5" />
                </template>
                Reset
              </Button>
            </div>
          </template>
          <Sys001structureForm
            ref="sys001structureFormRef"
            :form-schema="formSchema"
            @submit="submit"
          />
        </Card>
      </div>
    </div>
  </Page>
</template>
