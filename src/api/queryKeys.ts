import type { GetGatheringsQuery } from './gatherings/gatherings.types'

/** 使用者聚會列表查詢參數 */
export type UserGatheringsListAllQuery = Omit<
  GetGatheringsQuery,
  'page' | 'limit' | 'sortBy' | 'sortOrder'
>

/** TanStack Query keys */
export class QueryKeys {
  static readonly auth = {
    all: ['auth'] as const,
    login: () => ['auth', 'login'] as const,
    logout: () => ['auth', 'logout'] as const,
    register: () => ['auth', 'register'] as const,
  }

  static readonly gatherings = {
    all: ['gatherings'] as const,
    list: (query: GetGatheringsQuery) => ['gatherings', 'list', query] as const,
    listAll: (query: Omit<GetGatheringsQuery, 'page' | 'limit' | 'sortBy' | 'sortOrder'>) =>
      ['gatherings', 'list-all', query] as const,
    detail: (id: number) => ['gatherings', 'detail', id] as const,
    participants: (id: number) => ['gatherings', 'participants', id] as const,
  }

  static readonly users = {
    all: ['users'] as const,
    listAll: () => ['users', 'list-all'] as const,
    detail: (id: number) => ['users', 'detail', id] as const,
    createdGatheringsListAll: (userId: number, query: UserGatheringsListAllQuery) =>
      ['users', userId, 'gatherings-created', query] as const,
    participatedGatheringsListAll: (userId: number, query: UserGatheringsListAllQuery) =>
      ['users', userId, 'gatherings-participated', query] as const,
  }

  static readonly tags = {
    all: ['tags'] as const,
    listAll: () => ['tags', 'list-all'] as const,
  }
}
