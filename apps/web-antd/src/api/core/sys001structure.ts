import { IResponse } from '../../typings/common';
import type { Recordable, Sys001structure } from '@vben/types';

import { requestClient } from '#/api/request';
import type { StructureSortType } from '#/typings/type';


async function getAllStructuresApi() {
  return requestClient.get<Sys001structure>('/sys001structure/all');
}

async function createOrUpdateStructure(data: Recordable<Sys001structure>, id: number | undefined) {
  return requestClient.post<IResponse<Sys001structure>>('/sys001structure', { ...data, id }, { responseReturn: "body" });
}

/**
 * 获取用户所有菜单
 */
async function getAllMenusApi() {
  return requestClient.get<Sys001structure[]>('/sys001structure/menu-by-user');
}

const sort = async (payload: StructureSortType[]) => {
    return requestClient.put<IResponse>(`/sys001structure/sort`, payload, { responseReturn: "body" });
};

export const sys001structureApi = {
  getAllStructuresApi,
  createOrUpdateStructure,
  getAllMenusApi,
  sort
} 
