<script setup lang="ts">
import type { Recordable, Sys001structure } from '@vben/types';

import type { VbenFormSchema } from '@vben-core/form-ui';

import { computed, reactive, ref } from 'vue';

import { $t } from '@vben/locales';

import { useVbenForm } from '@vben-core/form-ui';
import { VbenButton } from '@vben-core/shadcn-ui';

interface Props {
  formSchema?: VbenFormSchema[];
}

const props = withDefaults(defineProps<Props>(), {
  formSchema: () => [],
});

const emit = defineEmits<{
  submit: [Recordable<any>];
}>();

const [Form, formApi] = useVbenForm(
  reactive({
    commonConfig: {
      componentProps: {
        class: 'w-full',
      },
    },
    layout: 'vertical',
    schema: computed(() => props.formSchema),
    showDefaultActions: false,
  }),
);

const isLoading = ref(false)

async function handleSubmit() {
  isLoading.value = true
  const { valid } = await formApi.validate();
  const values = await formApi.getValues();
  console.log(values);
  if (valid) {
    emit('submit', values);
  }
  isLoading.value = false
}

const selectNode = (node: Sys001structure) => {
  formApi.setValues({
    ...node,
    authCode: node.authCode ?? []
  });
};

const resetForm = async () => await formApi.reset();
const clearValidation = async () => await formApi.clearValidation();
const setValues = async (options: any) => await formApi.setValues(options)

defineExpose({
  getFormApi: () => formApi,
  selectNode,
  resetForm,
  clearValidation,
  setValues
});
</script>
<template>
  <div @keydown.enter.prevent="handleSubmit">
    <Form />
    <VbenButton type="submit" :loading="isLoading" class="float-right" @click="handleSubmit">
      {{ $t('Save') }}
    </VbenButton>
  </div>
</template>
