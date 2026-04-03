import type { GetGatheringsQuery } from './gatherings/gatherings.types'

/** TanStack Query keys */
export class QueryKeys {
  static readonly auth = {
    all: ['auth'] as const,
    login: () => ['auth', 'login'] as const,
    register: () => ['auth', 'register'] as const,
    logout: () => ['auth', 'logout'] as const,
  }

  static readonly gatherings = {
    all: ['gatherings'] as const,
    list: (query: GetGatheringsQuery) => ['gatherings', 'list', query] as const,
    detail: (id: number) => ['gatherings', 'detail', id] as const,
  }
}
