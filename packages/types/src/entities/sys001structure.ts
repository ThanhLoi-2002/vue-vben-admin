import type { MenuType } from "../enum";
import type { BaseEntity } from "./base-entity";

interface Sys001structure extends BaseEntity {
  pid: number;
  name: string;
  icon: string;
  order: number
  description: string;
  type: number;
  authCode: string[];
  component: string;
  layout: string
  path: string;
  menuType: MenuType;
  // meta: {
  //   order: number;
  //   title: string;
  //   affixTab: boolean;
  //   keepAlive: boolean;
  //   icon: string;
  //   authority: string[];
  //   menuVisibleWithForbidden: boolean;
  //   badge: string;
  //   badgeType: string;
  //   badgeVariants: string;
  // }
  children: Sys001structure[];
}

export type { Sys001structure }
