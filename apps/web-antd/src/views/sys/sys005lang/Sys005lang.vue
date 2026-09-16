<script setup lang="ts">
import { useSys005langStore } from '#/store/sys/sys005lang';
import type { Sys005lang } from '@vben/types';
import { Button, Card, Input, Popconfirm, Space } from 'ant-design-vue';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { ref } from 'vue';
import { IconifyIcon } from '@vben/icons';
import { useTranslate } from '#/composables/useTranslate';

const sys005langStore = useSys005langStore();
const { t } = useTranslate();
const pagination = ref({ page: 1, pageSize: 20 });

// Biến lưu trữ giá trị search của từng cột
const searchParams = ref({
  code: '',
  vi: '',
  en: '',
  cn: '',
  tw: '',
});

// Hàm trigger tìm kiếm khi bấm Enter, blur hoặc click nút Search
const handleSearch = () => {
  gridApi.query();
};

const handleEdit = (row: Sys005lang) => {
  console.log('Edit row:', row);
};

const handleDelete = async (row: Sys005lang) => {
  gridApi.query();
};

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    seqConfig: {
      seqMethod: ({ $rowIndex }: any) => {
        return (pagination.value.page - 1) * pagination.value.pageSize + $rowIndex + 1;
      },
    },
    columns: [
      { title: '#', type: 'seq', width: 50 },
      {
        field: 'code',
        title: 'Code',
        align: 'left',
        slots: { header: 'code_header' },
      },
      {
        field: 'vi',
        sortable: true,
        title: 'Vi',
        align: 'left',
        slots: { header: 'vi_header' },
      },
      {
        field: 'en',
        title: 'En',
        align: 'left',
        slots: { header: 'en_header' },
      },
      { field: 'cn', title: 'Cn', align: 'left', slots: { header: 'cn_header' } },
      {
        field: 'tw',
        showOverflow: true,
        title: 'Tw',
        align: 'left',
        slots: { header: 'tw_header' },
      },
      {
        title: 'Action',
        field: 'action',
        fixed: 'right',
        width: 150,
        align: 'center',
        // Khai báo thêm header slot cho cột Action
        slots: { header: 'action_header', default: 'action' },
      },
    ],
    pagerConfig: {
      enabled: true,
      pageSize: 20,
      pageSizes: [10, 20, 50, 100],
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }: any) => {
          pagination.value.page = page.currentPage;
          pagination.value.pageSize = page.pageSize;

          const params = {
            page: page.currentPage - 1,
            pageSize: page.pageSize,
            ...searchParams.value,
          };

          const res = await sys005langStore.getAll(params);

          return {
            items: res.content,
            total: res.total,
          };
        },
      },
    },
  },
});
</script>

<template>
  <Card title="sys005lang" :bordered="false">
    <Grid>
      <!-- Header Slot: Cột Code -->
      <template #code_header="{ column }">
        <div class="flex flex-col gap-1 py-1">
          <span>{{ column.title }}</span>
          <Input
            v-model:value="searchParams.code"
            size="small"
            allow-clear
            @press-enter="handleSearch"
            @clear="handleSearch"
          />
        </div>
      </template>

      <!-- Header Slot: Cột Vi -->
      <template #vi_header="{ column }">
        <div class="flex flex-col gap-1 py-1">
          <span>{{ column.title }}</span>
          <Input
            v-model:value="searchParams.vi"
            size="small"
            allow-clear
            @press-enter="handleSearch"
            @clear="handleSearch"
          />
        </div>
      </template>

      <!-- Header Slot: Cột En -->
      <template #en_header="{ column }">
        <div class="flex flex-col gap-1 py-1">
          <span>{{ column.title }}</span>
          <Input
            v-model:value="searchParams.en"
            size="small"
            allow-clear
            @press-enter="handleSearch"
            @clear="handleSearch"
          />
        </div>
      </template>

      <!-- Header Slot: Cột Cn -->
      <template #cn_header="{ column }">
        <div class="flex flex-col gap-1 py-1">
          <span>{{ column.title }}</span>
          <Input
            v-model:value="searchParams.cn"
            size="small"
            allow-clear
            @press-enter="handleSearch"
            @clear="handleSearch"
          />
        </div>
      </template>

      <!-- Header Slot: Cột Tw -->
      <template #tw_header="{ column }">
        <div class="flex flex-col gap-1 py-1">
          <span>{{ column.title }}</span>
          <Input
            v-model:value="searchParams.tw"
            size="small"
            allow-clear
            @press-enter="handleSearch"
            @clear="handleSearch"
          />
        </div>
      </template>

      <!-- Header Slot: Cột Action (Thay bằng nút Tìm kiếm) -->
      <template #action_header>
        <Button type="primary" size="small" class="!inline-flex items-center !py-3 !px-2" @click="handleSearch">
          <template #icon><IconifyIcon icon="akar-icons:search" class="w-4 h-4" /></template>
          <span>{{ t('search') }}</span>
        </Button>
      </template>

      <!-- Row Action Slot -->
      <template #action="{ row }">
        <Space>
          <Button type="primary" size="small" @click="handleEdit(row as Sys005lang)"> {{ t('edit') }} </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa không?"
            ok-text="Có"
            cancel-text="Không"
            @confirm="handleDelete(row as Sys005lang)"
          >
            <Button type="primary" danger size="small"> {{ t('delete') }} </Button>
          </Popconfirm>
        </Space>
      </template>
    </Grid>
  </Card>
</template>
