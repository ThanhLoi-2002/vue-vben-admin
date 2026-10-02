<script setup lang="ts">
import { useTranslate } from '#/composables/useTranslate';
import { Card } from 'ant-design-vue';
import ButtonGroup from '#/components/shared/ButtonGroup/ButtonGroup.vue';
import { subMenus } from './utils/constant';

const { t } = useTranslate();
</script>
<template>
  <div class="p-3">
    <Card>
      <template #title>
        <div class="flex items-center justify-between">
          <span>{{ t('sys003role') }}</span>
          <div>
            <ButtonGroup :items="subMenus" />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>
