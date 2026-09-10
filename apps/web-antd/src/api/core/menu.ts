import { IResponse } from './../../typings/common';
import type { Recordable, Sys001structure } from '@vben/types';

import { requestClient } from '#/api/request';


export async function getAllStructuresApi() {
  return requestClient.get<Sys001structure>('/sys001structure/all');
}

export async function createOrUpdateStructure(data: Recordable<Sys001structure>, id: number | undefined) {
  return requestClient.post<IResponse<Sys001structure>>('/sys001structure', { ...data, id }, { responseReturn: "body" });
}

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  return requestClient.get<Sys001structure[]>('/sys001structure/menu-by-user');
}
