<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Button, Space } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { ButtonGroupItem } from '#/typings/common';
import { useTranslate } from '#/composables/useTranslate';

const props = defineProps<{
  items: ButtonGroupItem[];
}>();

// Khai báo alias cho Space.Compact
const SpaceCompact = Space.Compact;

const router = useRouter();
const route = useRoute();
const { t } = useTranslate();

const activeKey = ref<string>('');

// Highlight nút tương ứng với route hiện tại
watch(
  [() => route.path, () => props.items],
  ([newPath]) => {
    const currentItem = props.items.find((item) => {
      // 1. Trường hợp url rỗng ('') hoặc '/' -> Khớp với trang gốc/trang danh sách
      if (!item.url || item.url === '/') {
        // Kiểm tra nếu route.path không chứa các sub-path của nút khác
        return !props.items.some(
          (other) =>
            other.url && other.url !== '/' && newPath.endsWith(`/${other.url}`),
        );
      }

      // 2. Kiểm tra nếu path hiện tại kết thúc bằng /item.url (ví dụ: /role/new endsWith /new)
      return newPath.endsWith(`/${item.url}`) || newPath.endsWith(item.url);
    });

    if (currentItem) {
      activeKey.value = currentItem.url;
    }
  },
  { immediate: true },
);

// Xử lý chuyển trang
const handleNavigate = (item: ButtonGroupItem): void => {
  activeKey.value = item.url;

  // 1. Trường hợp mở Tab mới
  if (item.isOpenNewTab) {
    if (item.isExternal) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else {
      // Dùng router.resolve để lấy URL tuyệt đối của route nội bộ
      const routeData = router.resolve(item.url);
      window.open(routeData.href, '_blank');
    }
    return;
  }

  // 2. Trường hợp chuyển trang ở Tab hiện tại
  if (item.isExternal) {
    window.location.href = item.url;
  } else {
    router.push(item.url);
  }
};
</script>

<template>
  <SpaceCompact block>
    <Button
      v-for="item in items"
      :key="item.url"
      :type="activeKey === item.url ? 'primary' : 'default'"
      @click="handleNavigate(item)"
    >
      <template #icon v-if="item.icon">
        <IconifyIcon :icon="item.icon" />
      </template>
      {{ t(item.label) }}
    </Button>
  </SpaceCompact>
</template>
