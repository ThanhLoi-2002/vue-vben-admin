<script lang="ts" setup>
import { ref, watch } from 'vue';

import { IconifyIcon } from '@vben/icons';

import { Button, Tag } from 'ant-design-vue';

import { MenuType } from '#/typings/enum';
import type { Sys001structure } from '@vben/types';

// Đặt tên component để Vue nhận diện và gọi lại chính nó (Đệ quy)
defineOptions({
  name: 'TreeNodeItem',
});

const props = defineProps<{
  nodes: Sys001structure[];
  isReorderMode: boolean;
  selectedId: number | undefined
}>();

const emit = defineEmits<{
  (e: 'update:nodes', nodes: Sys001structure[]): void;
  (e: 'select:node', node: Sys001structure): void;
}>();

// Quản lý trạng thái mở/đóng các nhánh theo ID
const expandedMap = ref<Record<number, boolean>>({});

// Hàm đệ quy tự động bật trạng thái bung cho tất cả các node có children
const initExpandedState = (items: Sys001structure[]) => {
  items.forEach((node) => {
    if (node.id !== undefined) {
      expandedMap.value[node.id] = true; // Mặc định mở hết
    }
    if (node.children && node.children.length > 0) {
      initExpandedState(node.children);
    }
  });
};

// Chạy ngay khi component nhận được props.nodes lần đầu
initExpandedState(props.nodes);

// Hoặc dùng watch để tự động mở rộng nếu dữ liệu thay đổi async từ API
watch(
  () => props.nodes,
  (newNodes) => {
    if (newNodes) {
      initExpandedState(newNodes);
    }
  },
  { immediate: true, deep: true },
);

const toggleNode = (node: Sys001structure) => {
  if (node.id !== undefined) {
    expandedMap.value[node.id] = !expandedMap.value[node.id];
  }
};

const isExpanded = (node: Sys001structure) => {
  return node.id !== undefined ? !!expandedMap.value[node.id] : false;
};

// State quản lý kéo thả
const draggedNodeId = ref<number | undefined>(undefined);
const draggedParentList = ref<Sys001structure[] | undefined>(undefined);

// --- KÉO THẢ ĐỔI VỊ TRÍ CÙNG CẤP ---
const onDragStart = (e: DragEvent, node: Sys001structure, list: Sys001structure[]) => {
  if (!props.isReorderMode) return;
  draggedNodeId.value = node.id;
  draggedParentList.value = list;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(node.id));
  }
};

const onDragOver = (e: DragEvent) => {
  if (!props.isReorderMode) return;
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move';
  }
};

const onDrop = (e: DragEvent, targetNode: Sys001structure, list: Sys001structure[]) => {
  if (!props.isReorderMode) return;
  e.preventDefault();

  if (draggedNodeId.value === undefined || draggedParentList.value !== list) return;

  const oldIndex = list.findIndex((n) => n.id === draggedNodeId.value);
  const newIndex = list.findIndex((n) => n.id === targetNode.id);

  if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
    const movedItem = list.splice(oldIndex, 1)[0];
    movedItem && list.splice(newIndex, 0, movedItem);

    // Cập nhật lại số thứ tự STT
    list.forEach((item, index) => {
      item.stt = index + 1;
    });

    emit('update:nodes', [...list]);
  }

  draggedNodeId.value = undefined;
  draggedParentList.value = undefined;
};

// Chuyển màu Menu Type sang Ant Design Tag color tương ứng
const getMenuTypeColor = (menuType: string) => {
  const type = menuType?.toUpperCase();
  switch (type) {
    case MenuType.MENU:
      return 'blue';
    case MenuType.PAGE:
      return 'green';
    case MenuType.SUB_PAGE:
      return 'purple';
    default:
      return 'default';
  }
};
</script>

<template>
  <ul class="space-y-2">
    <template v-for="node in nodes" :key="node.id">
      <li
        class="transition-all"
        :draggable="isReorderMode"
        @dragstart="onDragStart($event, node, nodes)"
        @dragover="onDragOver"
        @drop="onDrop($event, node, nodes)"
      >
        <!-- Node Item -->
        <div
          class="flex items-center justify-between px-2 py-1.5 rounded-lg border cursor-pointer transition-colors duration-200"
          :class="{
            'border-dashed border-amber-400 bg-amber-50/30 cursor-grab active:cursor-grabbing hover:bg-amber-100/50':
              isReorderMode,
            'hover:bg-gray-100 hover:border-gray-300 dark:hover:bg-gray-600/40 dark:hover:border-gray-600 group':
              !isReorderMode,
            'bg-gray-100 border-gray-300 dark:bg-gray-600/40 dark:border-gray-600 group': selectedId === node.id
          }"
          @click="emit('select:node', node)"
        >
          <div class="flex items-center gap-2.5">
            <!-- Icon tay cầm kéo thả -->
            <span
              v-if="isReorderMode"
              class="text-amber-500 cursor-grab flex items-center"
              title="Kéo lên/xuống để đổi vị trí"
            >
              <IconifyIcon icon="mdi:drag-horizontal-variant" class="w-4 h-4" />
            </span>

            <!-- Nút Thu gọn / Mở rộng dùng Ant Design Button -->
            <Button
              v-if="node?.children && node.children.length > 0"
              type="text"
              size="small"
              class="w-5 h-5 !flex items-center justify-center p-0 text-gray-500 hover:text-gray-800"
              @click="toggleNode(node)"
            >
              <template #icon>
                <IconifyIcon
                  icon="lucide:chevron-right"
                  class="w-4 h-4 transform transition-transform duration-200"
                  :class="{ 'rotate-90': isExpanded(node) }"
                />
              </template>
            </Button>
            <div v-else class="w-5"></div>

            <!-- Icon -->
            <span class="text-base">
              <IconifyIcon
                v-if="node.icon"
                :icon="node.icon"
                class="w-4 h-4"
              />
            </span>

            <!-- Tên & Path -->
            <div class="flex flex-col gap-y-0.5">
              <span
                class="text-gray-500 bg-white dark:text-gray-400 dark:bg-gray-500/30 px-1 rounded border shadow"
                >{{ node.name }}</span>
              <span v-if="node.path" class="text-xs text-gray-400">{{ node.path }}</span>
            </div>

            <!-- Menu Type Badge dùng Ant Design Tag -->
            <Tag
              :color="getMenuTypeColor(node.menuType)"
              class="uppercase font-bold text-[10px] m-0"
            >
              {{ node.menuType }}
            </Tag>
          </div>

          <!-- action -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="w-5 h-5 hidden group-hover:flex items-center justify-center p-0.5 rounded bg-transparent text-gray-500 hover:bg-gray-400/20 dark:text-gray-400 transition-colors"
              @click.stop="() => {}"
              title="Thêm node con"
            >
              <IconifyIcon icon="akar-icons:circle-plus" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Đệ quy hiển thị nhánh con -->
        <div
          v-if="node.children && node.children.length > 0 && isExpanded(node)"
          class="pl-5 mt-2 border-l-1 border-gray-200 dark:border-gray-600 ml-4 space-y-2"
        >
          <TreeNodeItem
            :nodes="node.children"
            :is-reorder-mode="isReorderMode"
            :selected-id="selectedId"
            @update:nodes="
              (newChildren) => {
                node.children = newChildren;
                emit('update:nodes', [...nodes]);
              }
            "
            @select:node="(childNode) => emit('select:node', childNode)"
          />
        </div>
      </li>
    </template>
  </ul>
</template>
