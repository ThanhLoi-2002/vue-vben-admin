
import { ref } from 'vue';

import { defineStore } from 'pinia';

import { getAllStructuresApi } from '#/api';

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

  function $reset() {
    isLoading.value = false;
  }

  return {
    $reset,
    getAllStructures,
    isLoading,
  };
});
