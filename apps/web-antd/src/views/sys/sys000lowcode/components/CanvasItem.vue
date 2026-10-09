<script setup lang="ts">
import type { ButtonType } from 'ant-design-vue/es/button';
import type { ComponentItem } from '#/typings/common';

import { computed } from 'vue';
import draggable from 'vuedraggable';
import { Button } from 'ant-design-vue';

import { componentMap } from '../data/antdv.components';

const props = defineProps<{
  element: ComponentItem;
  selectedId: null | string;
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'remove'): void;
  (e: 'update:element', val: ComponentItem): void;
}>();

// Sử dụng computed getter/setter để tránh lỗi vue/no-mutating-props
const childrenList = computed({
  get: () => props.element.children || [],
  set: (val) => {
    // Tạo object mới kế thừa từ element và cập nhật children để không làm đột biến prop
    emit('update:element', {
      ...props.element,
      children: val,
    });
  },
});

const isContainer = computed(() => Array.isArray(props.element.children));
const isCard = computed(
  () =>
    props.element.type === 'Card Container' || props.element.type === 'Card',
);
</script>

<template>
  <div
    class="relative group transition-all rounded p-1 border border-transparent hover:border-blue-400/60"
    :class="{
      '!border-blue-500 ring-1 ring-blue-500/50 bg-blue-50/10':
        selectedId === element.id,
    }"
    @click.stop="emit('select', element.id)"
  >
    <!-- Nút xóa item -->
    <button
      class="absolute -top-2 -right-2 text-white bg-red-500 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold z-30 rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-md"
      title="Xóa"
      @click.stop="emit('remove')"
    >
      ✕
    </button>

    <!-- TRƯỜNG HỢP 1: CARD CONTAINER -->
    <component
      :is="componentMap[element.type]"
      v-if="isCard && componentMap[element.type]"
      v-bind="element.props"
      class="w-full"
    >
      <template #title v-if="element.customTitle">
        <div class="flex items-center justify-between">
          <span>{{ element.customTitle.text || 'Tiêu đề Card' }}</span>
          <Button
            v-if="element.customTitle.showActionButton"
            :type="(element.customTitle.buttonType as ButtonType) || 'default'"
            size="small"
          >
            {{ element.customTitle.buttonText || 'Nút hành động' }}
          </Button>
        </div>
      </template>

      <draggable
        v-model="childrenList"
        :group="{ name: 'lowcode', pull: true, put: true }"
        item-key="id"
        animation="200"
        class="w-full h-full min-h-[60px] border border-dashed border-gray-300 dark:border-neutral-700 rounded p-2 flex gap-2 flex-wrap"
        :class="
          element.layoutDirection === 'row'
            ? 'flex-row items-center'
            : 'flex-col items-stretch'
        "
      >
        <template #item="{ element: childElement, index: childIndex }">
          <CanvasItem
            :element="childElement"
            :selected-id="selectedId"
            @select="(id) => emit('select', id)"
            @remove="childrenList.splice(childIndex, 1)"
          />
        </template>
      </draggable>
    </component>

    <!-- TRƯỜNG HỢP 2: LAYOUT / CONTAINER CHUNG -->
    <component
      :is="componentMap[element.type]"
      v-else-if="isContainer && componentMap[element.type]"
      v-bind="element.props"
      class="w-full min-h-[50px] flex gap-2 items-center"
    >
      <draggable
        v-model="childrenList"
        :group="{ name: 'lowcode', pull: true, put: true }"
        item-key="id"
        animation="200"
        class="w-full h-full min-h-[45px] border border-dashed border-gray-400/50 dark:border-neutral-600 rounded p-2 flex flex-wrap gap-2 items-center"
      >
        <template #item="{ element: childElement, index: childIndex }">
          <CanvasItem
            :element="childElement"
            :selected-id="selectedId"
            @select="(id) => emit('select', id)"
            @remove="childrenList.splice(childIndex, 1)"
          />
        </template>
      </draggable>
    </component>

    <!-- TRƯỜNG HỢP 3: COMPONENT ĐƠN LẺ -->
    <template v-else-if="componentMap[element.type]">
      <component :is="componentMap[element.type]" v-bind="element.props">
        <template v-if="element.props?.label">
          {{ element.props.label }}
        </template>
        <template v-else-if="element.slot">{{ element.slot }}</template>
      </component>
    </template>

    <div
      v-else
      class="text-red-400 text-xs italic p-1 border border-dashed border-red-300 rounded"
    >
      Chưa đăng ký: {{ element.type }}
    </div>
  </div>
</template>
