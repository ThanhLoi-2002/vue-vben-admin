import type { BaseEntity } from "./base-entity"

export interface Sys002user extends BaseEntity {
    username: string
    name: string
    avatar: string
    roles: string[]
    permissions: string[]
}
