import type { ComponentRecordType } from "@vben/types";

import { BasicLayout, EmptyLayout, IFrameView } from '#/layouts';

export const layoutMap: ComponentRecordType = {
  BasicLayout,
  IFrameView,
  EmptyLayout,
};

export enum LayoutEnum {
  BasicLayout = 'BasicLayout',
  IFrameView = 'IFrameView',
  EmptyLayout = 'EmptyLayout',
}
