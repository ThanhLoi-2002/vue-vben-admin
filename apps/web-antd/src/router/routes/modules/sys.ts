import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1000,
      title: $t('sys'),
    },
    name: 'sys',
    path: '/sys',
    children: [
      {
        meta: {
          title: $t('sys001structure'),
        },
        name: 'sys001structure',
        path: 'sys001structure',
        component: () => import('#/views/sys/sys001structure/Sys001structure.vue'),
      },
    ],
  },
];

export default routes;
