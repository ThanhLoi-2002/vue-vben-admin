import type { Sys001structure } from '@vben/types';

import { requestClient } from '#/api/request';


export async function getAllStructuresApi() {
  return requestClient.get<Sys001structure>('/sys001structure/all');
}

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  return requestClient.get<Sys001structure[]>('/sys001structure/menu-by-user');
}
