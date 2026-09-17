import { IResponse } from './../../../typings/common';
import { type PaginationType } from '../../../typings/common';
import type { Sys005lang } from '@vben/types';

import { requestBodyClient } from '#/api/request';
import type { Sys005langFilter } from '#/typings/filter';


async function getAll(filter: Sys005langFilter) {
  return requestBodyClient.get<IResponse<PaginationType<Sys005lang>>>('/sys005lang', {
    params: filter,
  });
}

const getListByLang = async (lang: string) => {
  return requestBodyClient.get<IResponse>(`/sys005lang/getByLang/${lang}`);
};

const getDetail = async (id: number) => {
  return requestBodyClient.get<Sys005lang>(`/sys005lang/${id}`);
}

const createOrUpdate = async (data: any, id?: number) => {
  if (id)
    return requestBodyClient.put<Sys005lang>(`/sys005lang/${id}`, data);
  else return requestBodyClient.post<Sys005lang>(`/sys005lang`, data);
}

const deleteOne = async (id: number) => {
  return requestBodyClient.delete(`/sys005lang/${id}`);
}

export const sys005langApi = {
  getAll, getListByLang, createOrUpdate, deleteOne, getDetail
} 
