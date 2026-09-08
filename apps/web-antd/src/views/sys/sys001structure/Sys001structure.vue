<script lang="ts" setup>
import type { Sys001structure } from '#/typings/entities/sys001structure';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Button, Card } from 'ant-design-vue';

import { useSys001structureStore } from '#/store';

import TreeNodeItem from './components/TreeNodeItem.vue';

const sys001structureStore = useSys001structureStore();

// Mảng chứa toàn bộ cấu trúc tree ở cấp root
const treeData = ref<Sys001structure[]>([]);

// State bật/tắt chế độ kéo thả di chuyển node
const isReorderMode = ref<boolean>(false);

onMounted(async () => {
  const res = await sys001structureStore.getAllStructures();
  if (res) {
    // Đảm bảo dữ liệu luôn là mảng
    treeData.value = Array.isArray(res) ? res : [res];
  }
});
</script>

<template>
  <Page title="TreeView Demo" description="Sử dụng Ant Design Tree trong Vben Admin">
    <div class="flex flex-col lg:flex-row">
      <div class="mr-4 w-full lg:w-3/5">
        <Card>
          <!-- Sử dụng slot #title để tùy biến tiêu đề và đặt nút sang bên phải -->
          <template #title>
            <div class="flex items-center justify-between">
              <span>Cấu trúc Menu Hệ thống</span>
              <Button
                @click="isReorderMode = !isReorderMode"
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
          <div class="p-4 rounded-xl shadow-sm border w-full">
            <!-- Gọi component con đệ quy để hiển thị danh sách -->
            <TreeNodeItem
              :nodes="treeData"
              :is-reorder-mode="isReorderMode"
              @update:nodes="(newNodes) => (treeData = newNodes)"
            />
          </div>
        </Card>
      </div>
      <div class="w-full lg:w-2/5">
        <Card>
          <!-- Sử dụng slot #title để tùy biến tiêu đề và đặt nút sang bên phải -->
          <template #title>
            <div class="flex items-center justify-between">
              <span>Form</span>
              <Button
                @click="isReorderMode = !isReorderMode"
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
          <div class="p-4 rounded-xl shadow-sm border w-full"></div>
        </Card>
      </div>
    </div>
  </Page>
</template>
