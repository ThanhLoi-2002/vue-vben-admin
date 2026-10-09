<script setup lang="ts">
import { computed, ref } from 'vue';
import draggable from 'vuedraggable';
import { Card, Input, Tabs, Tag, Typography } from 'ant-design-vue';
import { useTranslate } from '#/composables/useTranslate';
import { IconifyIcon } from '@vben/icons';
import { antdComponents } from '../data/antdv.components';

const { Text } = Typography;
const { t } = useTranslate();

const activeTab = ref<'antd' | 'custom'>('antd');
const search = ref('');

const filteredAntdComponents = computed(() => {
  if (!search.value.trim()) return antdComponents;
  const keyword = search.value.toLowerCase();
  return antdComponents.filter(
    (item) =>
      item.name.toLowerCase().includes(keyword) ||
      item.group.toLowerCase().includes(keyword),
  );
});

const cloneComponent = (item: any) => {
  const isContainer = [
    'Card',
    'Flex',
    'Form Container',
    'Grid Col',
    'Grid Row',
    'Space',
  ].includes(item.name);
  return {
    type: item.type || item.name,
    label: item.props?.label || item.name,
    slot: item.slot,
    props: {
      ...JSON.parse(JSON.stringify(item.props || {})),
      style: {
        width: item.name === 'Button' ? 'auto' : '100%', // Mặc định button vừa chữ, input full width
        ...item.props?.style,
      },
    },
    id: `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    ...(isContainer ? { children: [] } : {}),
  };
};

const tabList = [
  { key: 'antd', icon: 'logos:ant-design' },
  { key: 'custom', icon: 'boxicons:component' },
];
</script>

<template>
  <Card title="Thành phần UI" class="w-1/4 h-full flex flex-col">
    <div class="flex flex-col gap-3 h-full overflow-hidden">
      <Input
        v-model:value="search"
        :placeholder="t('search')"
        allow-clear
        size="middle"
      />

      <Tabs
        v-model:active-key="activeTab"
        class="flex-1 flex flex-col overflow-hidden"
      >
        <Tabs.TabPane v-for="tab in tabList" :key="tab.key" class="h-full">
          <template #tab>
            <span class="flex items-center gap-2">
              <IconifyIcon :icon="tab.icon" />
              {{ t(tab.key) }}
            </span>
          </template>

          <div v-if="tab.key === 'antd'" class="h-full flex flex-col">
            <draggable
              :list="filteredAntdComponents"
              :group="{ name: 'lowcode', pull: 'clone', put: false }"
              :clone="cloneComponent"
              :sort="false"
              item-key="name"
              class="flex flex-col gap-3 max-h-[calc(100vh-420px)] overflow-y-auto pr-1 pb-1"
            >
              <template #item="{ element }">
                <Card
                  size="small"
                  hoverable
                  class="cursor-move border-dashed hover:border-blue-500 transition-colors select-none shrink-0 overflow-hidden"
                  :body-style="{ padding: '12px' }"
                >
                  <div class="flex items-center justify-between mb-2">
                    <Text
                      strong
                      class="text-xs text-gray-700 dark:text-gray-200"
                    >
                      {{ element.name }}
                    </Text>
                    <Tag color="blue" class="text-[10px] mr-0">
                      {{ element.group }}
                    </Tag>
                  </div>

                  <div
                    class="pt-1 pointer-events-none relative overflow-hidden min-h-[30px] flex items-center justify-center"
                  >
                    <component :is="element.component" v-bind="element.props">
                      <template v-if="element.slot">
                        {{ element.slot }}
                      </template>
                    </component>
                  </div>
                </Card>
              </template>
            </draggable>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  </Card>
</template>
