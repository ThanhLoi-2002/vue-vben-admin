<script setup lang="ts">
import { useTranslate } from '#/composables/useTranslate';
import { Card } from 'ant-design-vue';
import { subMenus } from './utils/constant';
import ButtonGroup from '#/components/shared/ButtonGroup/ButtonGroup.vue';

const { t } = useTranslate();
</script>

<template>
  <div class="p-3">
    <Card>
      <template #title>
        <div class="flex items-center justify-between">
          <span>{{ t('new') }}</span>
          <div>
            <ButtonGroup :items="subMenus" />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>
