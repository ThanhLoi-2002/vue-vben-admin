<script setup lang="ts">
import { ref } from 'vue';
import draggable from 'vuedraggable';
import { Button, Card } from 'ant-design-vue';
import { Page } from '@vben/common-ui';
import ComponentSection from './components/ComponentSection.vue';
import SettingSection from './components/SettingSection.vue';
import CanvasItem from './components/CanvasItem.vue'; // <--- Import component đệ quy
import type { ComponentItem } from '#/typings/common';

const canvasList = ref<ComponentItem[]>([]);
const selectedId = ref<null | string>(null);

const removeItem = (index: number) => {
  if (selectedId.value === canvasList.value[index]?.id) {
    selectedId.value = null;
  }
  canvasList.value.splice(index, 1);
};
</script>

<template>
  <Page title="Low-Code Page Builder">
    <div class="flex w-full gap-4 h-[calc(100vh-220px)]">
      <ComponentSection />

      <!-- CANVAS THIẾT KẾ -->
      <Card
        class="w-2/4 h-full flex flex-col"
        :body-style="{ height: 'calc(100% - 57px)', padding: '12px' }"
      >
        <template #title>
          <div class="flex items-center justify-between">
            <span>Canvas thiết kế</span>
            <Button
              type="primary"
              danger
              size="small"
              @click="canvasList = []"
              v-if="canvasList.length"
            >
              Xóa hết
            </Button>
          </div>
        </template>

        <div class="h-full w-full">
          <draggable
            :list="canvasList"
            group="lowcode"
            item-key="id"
            animation="200"
            class="w-full h-full p-3 bg-gray-50/50 dark:bg-neutral-900/70 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col gap-3 overflow-y-auto min-h-[300px]"
          >
            <template #item="{ element, index }">
              <CanvasItem
                :element="element"
                :selected-id="selectedId"
                @select="(id) => (selectedId = id)"
                @remove="removeItem(index)"
                @update:element="(val) => (canvasList[index] = val)"
              />
            </template>
          </draggable>
        </div>
      </Card>

      <SettingSection :canvas-list="canvasList" :selected-id="selectedId" />
    </div>
  </Page>
</template>
