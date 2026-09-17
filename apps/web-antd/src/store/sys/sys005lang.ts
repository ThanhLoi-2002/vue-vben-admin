
import { ref } from 'vue';

import { defineStore } from 'pinia';

import { sys005langApi } from '#/api/core/sys/sys005lang';
import type { Sys005langFilter } from '#/typings/filter';
import { message } from 'ant-design-vue';

export const useSys005langStore = defineStore('sys005lang', () => {
  const isLoading = ref(false);
  const langTranslate = ref<Record<string, string>>({})
  const langCode = ref<string>('vi')

  async function getAll(filter: Sys005langFilter) {
    try {
      isLoading.value = true;
      const { data: { content, page: { totalElements } } } = await sys005langApi.getAll(filter);
      return { content, total: totalElements }
    } catch (e: any) {
      return { content: [], total: 0 }
    } finally {
      isLoading.value = false;
    }
  }

  function setLangCode(lang: string) {
    langCode.value = lang
  }

  async function getListByLang() {
    try {
      const { data } = await sys005langApi.getListByLang(langCode.value);
      langTranslate.value = data
    } catch (e: any) {
      message.error(e.message)
    }
  }

  return {
    getAll,
    getListByLang,
    setLangCode,
    isLoading,
    langTranslate,
    langCode
  };
}, {
  persist: {
    pick: ['langCode'],
  },
},);
