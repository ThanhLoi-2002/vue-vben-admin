import { defineStore } from 'pinia';

import { sys001structureApi } from '#/api';
import type { Recordable, Sys001structure } from '@vben/types';
import { notification } from 'ant-design-vue';
import type { StructureSortType } from '#/typings/type';

export const useSys001structureStore = defineStore('sys001structure', {
  state: () => ({
    isLoading: false,
  }),

  actions: {
    /**
     * 异步处理登录操作
     * Asynchronously handle the login process
     * @param params 登录表单数据
     */
    async getAllStructures() {
      try {
        this.isLoading = true;
        const data = await sys001structureApi.getAllStructuresApi();
        return data;
      } catch (e: any) {
        return undefined;
      } finally {
        this.isLoading = false;
      }
    },

    async createOrUpdateNode(node: Recordable<Sys001structure>, id: number | undefined) {
      try {
        const { message: m, data } = await sys001structureApi.createOrUpdateStructure(node, id);

        notification.success({
          duration: 3,
          message: m,
        });
        return data;
      } catch (e: any) {
        return undefined;
      }
    },

    async sort(data: StructureSortType[]) {
      try {
        const { message } = await sys001structureApi.sort(data);

        notification.success({
          duration: 3,
          message,
        });
        return data;
      } catch (e: any) {
        return undefined;
      }
    },
  },
});
