<script setup lang="ts">
import type { LanguageOption } from '@vben/constants';

import { ref } from 'vue';

import { SUPPORT_LANGUAGES_2 } from '@vben/constants';
import { Languages } from '@vben/icons';
import { preferences } from '@vben/preferences';

import { VbenDropdownRadioMenu, VbenIconButton } from '@vben-core/shadcn-ui';

defineOptions({
  name: 'LanguageToggle2',
});

const emit = defineEmits<{
  changeLang: [lang: string];
}>()

const languageList = ref<LanguageOption[]>(SUPPORT_LANGUAGES_2);

async function handleUpdate(value: string | undefined) {
  if (!value) return;
  emit('changeLang', value)
}
</script>

<template>
  <div>
    <VbenDropdownRadioMenu
      :menus="languageList"
      :model-value="preferences.app.langCode"
      @update:model-value="handleUpdate"
    >
      <VbenIconButton class="hover:animate-[shrink_0.3s_ease-in-out]">
        <Languages class="size-4 text-foreground" />
      </VbenIconButton>
    </VbenDropdownRadioMenu>
  </div>
</template>
