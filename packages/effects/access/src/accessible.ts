import type { Component, DefineComponent } from 'vue';

import { MenuTypeEnum } from '@vben/types';
import type {
  AccessModeType,
  GenerateMenuAndRoutesOptions,
  RouteRecordRaw,
} from '@vben/types';

import { defineComponent, h } from 'vue';

import {
  cloneDeep,
  generateMenus,
  generateRoutesByBackend,
  generateRoutesByFrontend,
  isFunction,
  isString,
  mapTree,
} from '@vben/utils';

async function generateAccessible(
  mode: AccessModeType,
  options: GenerateMenuAndRoutesOptions,
) {
  const { router } = options;

  options.routes = cloneDeep(options.routes);

  // 生成路由
  const { accessibleRoutes, menuRoutes } = await generateRoutes(mode, options);

  const root = router.getRoutes().find((item) => item.path === '/');

  // 获取已有的路由名称列表
  const names = root?.children?.map((item) => item.name) ?? [];

  // 动态添加到router实例内
  accessibleRoutes.forEach((route) => {
    if (root && !route.meta?.noBasicLayout) {
      // 为了兼容之前的版本用法，如果包含子路由，则将component移除，以免出现多层BasicLayout
      // 如果你的项目已经跟进了本次修改，移除了所有自定义菜单首级的BasicLayout，可以将这段if代码删除
      if (route.children && route.children.length > 0) {
        delete route.component;
      }
      // 根据router name判断，如果路由已经存在，则不再添加
      if (names?.includes(route.name)) {
        // 找到已存在的路由索引并更新，不更新会造成切换用户时，一级目录未更新，homePath 在二级目录导致的404问题
        const index = root.children?.findIndex(
          (item) => item.name === route.name,
        );
        if (index !== undefined && index !== -1 && root.children) {
          root.children[index] = route;
        }
      } else {
        root.children?.push(route);
      }
    } else {
      router.addRoute(route);
    }
  });

  if (root) {
    if (root.name) {
      router.removeRoute(root.name);
    }
    router.addRoute(root);
  }

  // 生成菜单
  const accessibleMenus = generateMenus(menuRoutes, options.router);

  return { accessibleMenus, accessibleRoutes };
}

/**
 * Generate routes
 * @param mode
 * @param options
 */
async function generateRoutes(
  mode: AccessModeType,
  options: GenerateMenuAndRoutesOptions,
) {
  const { forbiddenComponent, roles, routes } = options;

  let resultRoutes: RouteRecordRaw[] = routes;

  switch (mode) {
    case 'backend': {
      resultRoutes = await generateRoutesByBackend(options);
      break;
    }
    case 'frontend': {
      resultRoutes = await generateRoutesByFrontend(
        routes,
        roles || [],
        forbiddenComponent,
      );
      break;
    }
    case 'mixed': {
      const [frontend_resultRoutes, backend_resultRoutes] = await Promise.all([
        generateRoutesByFrontend(routes, roles || [], forbiddenComponent),
        generateRoutesByBackend(options),
      ]);
      resultRoutes = mergeRoutesByName(
        backend_resultRoutes,
        frontend_resultRoutes,
      );
      break;
    }
  }

  /**
   * Bước 1: Duyệt qua danh sách routes để tách các item có menuType === 'BUTTON'
   * ra khỏi children và đẩy lên cùng cấp với parent.
   */
  const extractButtons = (items: any[]): RouteRecordRaw[] => {
    const flatList: any[] = [];

    items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        // Lọc lấy các con là 'BUTTON'
        const buttons = item.children.filter(
          (child: any) =>
            child.meta?.menuType === MenuTypeEnum.BUTTON ||
            child.menuType === MenuTypeEnum.BUTTON,
        );

        // Giữ lại các con không phải 'BUTTON'
        const nonButtons = item.children.filter(
          (child: any) =>
            child.meta?.menuType !== MenuTypeEnum.BUTTON &&
            child.menuType !== MenuTypeEnum.BUTTON,
        );

        // Đệ quy xử lý tiếp cho các children không phải button
        item.children = extractButtons(nonButtons);

        // Đưa item hiện tại vào danh sách
        flatList.push(item);

        // Đưa các button con ra ngoài (cùng cấp với item)
        buttons.forEach((btn: any) => {
          delete btn.children; // Button thường không có children
          flatList.push(btn);
        });
      } else {
        flatList.push(item);
      }
    });

    return flatList;
  };

  resultRoutes = extractButtons(resultRoutes);

  // -------------------------------------------------------------
  // TÁCH LUỒNG: Tạo 1 bản sao nguyên vẹn dành riêng cho Menu
  // -------------------------------------------------------------
  const menuRoutes = cloneDeep(resultRoutes);

  // Luồng xử lý dành riêng cho Router đăng ký (bóc tách layout)
  let routerRoutes = cloneDeep(resultRoutes);

  /**
   * Bước 2: Tách các route có khai báo `layout` ra khỏi cây menu
   * và gom nhóm theo tên layout (ví dụ: 'empty', 'auth', ...)
   */
  const layoutRoutesMap: Record<string, RouteRecordRaw[]> = {};

  const extractLayoutRoutes = (items: any[]): RouteRecordRaw[] => {
    const result: any[] = [];

    items.forEach((item) => {
      // Tìm giá trị layout (hỗ trợ đọc từ item.layout hoặc item.meta.layout)
      const layoutName = item.layout || item.meta?.layout;

      if (layoutName) {
        if (!layoutRoutesMap[layoutName]) {
          layoutRoutesMap[layoutName] = [];
        }

        // Tách khỏi cha nên đảm bảo đường dẫn path là tuyệt đối nếu cần
        const routeToAdd = { ...item };
        delete routeToAdd.layout; // Xóa key layout sau khi đã bóc tách

        layoutRoutesMap[layoutName].push(routeToAdd);
      } else {
        // Nếu không có layout riêng, tiếp tục đệ quy quét con
        if (item.children && item.children.length > 0) {
          item.children = extractLayoutRoutes(item.children);
        }
        result.push(item);
      }
    });

    return result;
  };

  routerRoutes = extractLayoutRoutes(routerRoutes);

  /**
   * Bước 3: Đẩy các layout route vào Layout Container tương ứng
   */
  Object.keys(layoutRoutesMap).forEach((layoutKey) => {
    // Tìm Layout tương ứng trong danh sách routes (ví dụ: EmptyLayout có name/path khớp với layoutKey)
    const targetLayout = routerRoutes.find((r) => {
      const nameMatch =
        r.name?.toString().toLowerCase() === layoutKey.toLowerCase();
      const pathMatch =
        r.path?.replaceAll('/', '').toLowerCase() === layoutKey.toLowerCase();
      return nameMatch || pathMatch;
    });

    const routesToPush = layoutRoutesMap[layoutKey] ?? [];

    if (targetLayout) {
      targetLayout.children = targetLayout.children || [];
      targetLayout.children.push(...routesToPush);
    } else {
      // Trường hợp không tìm thấy Layout Container tương ứng, đẩy ra ngoài root dạng noBasicLayout
      routesToPush.forEach((route) => {
        route.meta = {
          ...route.meta,
          title: route.meta?.title ?? '',
          noBasicLayout: true,
        };
        routerRoutes.push(route);
      });
    }
  });

  /**
   * Chuẩn hóa component & redirect cho routerRoutes
   */
  const processRouteTree = (tree: RouteRecordRaw[]): RouteRecordRaw[] => {
    return mapTree(tree, (route, parent) => {
      if (
        route.meta?.keepAlive &&
        isFunction(route.component) &&
        route.name &&
        isString(route.name)
      ) {
        const originalComponent = route.component as () => Promise<{
          default: Component | DefineComponent;
        }>;
        route.component = async () => {
          const component = await originalComponent();
          if (!component.default) return component;
          return defineComponent({
            name: route.name as string,
            setup(props, { attrs, slots }) {
              return () => h(component.default, { ...props, ...attrs }, slots);
            },
          });
        };
      }

      if (route.redirect || !route.children || route.children.length === 0) {
        return route;
      }
      const firstChild = route.children[0];

      if (!firstChild?.path || firstChild.path.startsWith('/')) {
        return route;
      }

      if (firstChild.path.startsWith(':')) {
        return route;
      }

      if (parent && parent.redirect && isString(parent.redirect)) {
        const parentSplit = parent.redirect.split('/');
        parentSplit.splice(-1, 2, route.path, firstChild.path);
        const redirectPath = parentSplit.join('/');
        route.redirect = redirectPath;
      } else if (parent && parent.redirect) {
        route.redirect = `${parent.path}/${route.path}/${firstChild.path}`;
      } else {
        route.redirect = `${route.path}/${firstChild.path}`;
      }

      return route;
    });
  };

  routerRoutes = processRouteTree(routerRoutes);

  return {
    accessibleRoutes: routerRoutes,
    menuRoutes,
  };
}

/**
 * 根据 name 合并前后端路由
 * @param baseRoutes 后端路由
 * @param extraRoutes 前端路由
 */
function mergeRoutesByName(
  baseRoutes: RouteRecordRaw[],
  extraRoutes: RouteRecordRaw[],
): RouteRecordRaw[] {
  const result: RouteRecordRaw[] = [];
  const routeMap = new Map<string, RouteRecordRaw>();

  for (const route of baseRoutes) {
    const clone = { ...route } as RouteRecordRaw;
    result.push(clone);
    if (clone.name && isString(clone.name)) {
      routeMap.set(clone.name as string, clone);
    }
  }

  for (const route of extraRoutes) {
    if (
      route.name &&
      isString(route.name) &&
      routeMap.has(route.name as string)
    ) {
      const existing = routeMap.get(route.name as string);
      if (!existing) {
        continue;
      }
      const existingChildren = existing.children ?? [];
      const routeChildren = route.children ?? [];

      const merged = {
        ...route,
        ...existing, // keep backend as base
        meta: {
          ...route.meta,
          ...existing.meta, // backend meta wins on conflicts
        },
      } as RouteRecordRaw;

      if (existingChildren.length > 0 || routeChildren.length > 0) {
        merged.children = mergeRoutesByName(existingChildren, routeChildren);
      }

      Object.assign(existing, merged);
    } else {
      const clone = { ...route } as RouteRecordRaw;
      result.push(clone);
      if (clone.name && isString(clone.name)) {
        routeMap.set(clone.name as string, clone);
      }
    }
  }

  return result;
}

export { generateAccessible };
