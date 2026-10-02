import { IResponse } from '../../../typings/common';
import type { Recordable, Sys001structure } from '@vben/types';

import { requestBodyClient, requestClient } from '#/api/request';
import type { StructureSortType } from '#/typings/type';

async function getAllStructuresApi() {
  return requestBodyClient.get<IResponse<Sys001structure>>(
    '/sys001structure/all',
  );
}

async function createOrUpdateStructure(
  data: Recordable<Sys001structure>,
  id: number | undefined,
) {
  return requestBodyClient.post<IResponse<Sys001structure>>(
    '/sys001structure',
    { ...data, id },
  );
}

/**
 * 获取用户所有菜单
 */
async function getAllMenusApi() {
  return requestClient.get<Sys001structure[]>('/sys001structure/menu-by-user');
}

const sorted = async (payload: StructureSortType[]) => {
  return requestBodyClient.put<IResponse>(`/sys001structure/sort`, payload);
};

export const sys001structureApi = {
  getAllStructuresApi,
  createOrUpdateStructure,
  getAllMenusApi,
  sorted,
};
