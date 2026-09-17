import { defineStore } from 'pinia';
import { sys005langApi } from '#/api/core/sys/sys005lang';
import type { Sys005langFilter } from '#/typings/filter';
import { message } from 'ant-design-vue';
import { updatePreferences } from '@vben/preferences';

export const useSys005langStore = defineStore('sys005lang', {
  state: () => ({
    isLoading: false,
    langTranslate: {} as Record<string, string>,
    langCode: 'vi',
  }),

  actions: {
    async getAll(filter: Sys005langFilter) {
      try {
        this.isLoading = true;
        const {
          data: {
            content,
            page: { totalElements },
          },
        } = await sys005langApi.getAll(filter);
        return { content, total: totalElements };
      } catch (e: any) {
        return { content: [], total: 0 };
      } finally {
        this.isLoading = false;
      }
    },

    setLangCode(lang: string) {
      this.langCode = lang;
      updatePreferences({
        app: {
          langCode: lang
        }
      })
    },

    async getListByLang() {
      try {
        const { data } = await sys005langApi.getListByLang(this.langCode);
        this.langTranslate = data;
      } catch (e: any) {
        message.error(e.message);
      }
    },
  },

  persist: {
    pick: ['langCode'],
    // Chạy tự động NGAY KHI Pinia vừa lấy xong langCode từ localStorage ra
    afterHydrate: (state) => {
      updatePreferences({
        app: {
          langCode: state.store.langCode, // Lấy chính langCode vừa đọc từ LocalStorage
        },
      });
    },
  },
});
