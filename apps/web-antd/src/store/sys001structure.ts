
import { ref } from 'vue';

import { defineStore } from 'pinia';

import { sys001structureApi } from '#/api';
import type { Recordable, Sys001structure } from '@vben/types';
import { notification } from 'ant-design-vue';
import type { StructureSortType } from '#/typings/type';

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
      const data = await sys001structureApi.getAllStructuresApi();
      return data
    } catch (e: any) {
      return undefined
    } finally {
      isLoading.value = false;
    }
  }

  async function createOrUpdateNode(node: Recordable<Sys001structure>, id: number | undefined) {
    try {
      const { message: m, data } = await sys001structureApi.createOrUpdateStructure(node, id);

      notification.success({
        duration: 3,
        message: m,
      });
      return data
    } catch (e: any) {
      return undefined
    }
  }

  async function sort(data: StructureSortType[]) {
    try {
      const { message } = await sys001structureApi.sort(data);

      notification.success({
        duration: 3,
        message,
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
    sort,
    isLoading,
  };
});
