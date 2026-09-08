import type { Sys002user } from "./sys002user";

export interface BaseEntity {
    id: number;
    stt: number;
    cu?: number
    createdBy?: Sys002user
    ct?: Date
    eu?: number
    updatedBy?: Sys002user
    et?: Date
}
