
import { ref } from 'vue';

import { defineStore } from 'pinia';

import { createOrUpdateStructure, getAllStructuresApi } from '#/api';
import type { Recordable, Sys001structure } from '@vben/types';
import { notification } from 'ant-design-vue';

export const useSys001structureStore = defineStore('sys001structure', () => {
  const isLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function getAllStructures() {
    try {
      isLoading.value = true;
      const data = await getAllStructuresApi();
      return data
    } catch (e: any) {
      return undefined
    } finally {
      isLoading.value = false;
    }
  }

  async function createOrUpdateNode(node: Recordable<Sys001structure>, id: number | undefined) {
    try {
      const { message: m, data } = await createOrUpdateStructure(node, id);

      notification.success({
        duration: 3,
        message: m,
      });
      return data
    } catch (e: any) {
      return undefined
    }
  }

  function $reset() {
    isLoading.value = false;
  }

  return {
    $reset,
    getAllStructures,
    createOrUpdateNode,
    isLoading,
  };
});
