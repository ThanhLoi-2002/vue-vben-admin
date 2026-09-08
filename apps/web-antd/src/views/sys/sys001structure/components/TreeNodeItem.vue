<script lang="ts" setup>
import type { Sys001structure } from '#/typings/entities/sys001structure';

import { h, ref, watch } from 'vue';

import { IconifyIcon } from '@vben/icons';

import { Button, Tag } from 'ant-design-vue';

// Đặt tên component để Vue nhận diện và gọi lại chính nó (Đệ quy)
defineOptions({
  name: 'TreeNodeItem',
});

const props = defineProps<{
  nodes: Sys001structure[];
  isReorderMode: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:nodes', nodes: Sys001structure[]): void;
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
    case 'MENU':
      return 'blue';
    case 'PAGE':
      return 'green';
    case 'SUBMENU':
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
          class="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors"
          :class="{
            'border-dashed border-amber-400 bg-amber-50/30 cursor-grab active:cursor-grabbing':
              isReorderMode,
          }"
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
              <component
                :is="
                  node.meta?.icon
                    ? h(IconifyIcon, { icon: node.meta.icon, class: 'w-4 h-4 inline' })
                    : node.menuType === 'PAGE'
                      ? '📄'
                      : '📁'
                "
              />
            </span>

            <!-- Tên & Path -->
            <div class="flex flex-col">
              <span class="text-sm font-semibold text-gray-800">{{ node.name }}</span>
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

          <!-- Code & STT -->
          <div class="flex items-center gap-2">
            <span
              class="text-[10px] text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200"
            >
              STT: {{ node.stt }}
            </span>
            <span
              class="text-xs font-mono text-gray-600 bg-white px-2 py-1 rounded border border-gray-200 shadow-2xs"
            >
              {{ node.code }}
            </span>
          </div>
        </div>

        <!-- Đệ quy hiển thị nhánh con -->
        <div
          v-if="node.children && node.children.length > 0 && isExpanded(node)"
          class="pl-6 mt-2 border-l-2 border-gray-200 ml-4 space-y-2"
        >
          <TreeNodeItem
            :nodes="node.children"
            :is-reorder-mode="isReorderMode"
            @update:nodes="
              (newChildren) => {
                node.children = newChildren;
                emit('update:nodes', [...nodes]);
              }
            "
          />
        </div>
      </li>
    </template>
  </ul>
</template>
