import type { GetGatheringsQuery } from './gatherings/gatherings.types'
import type { GetTagsQuery } from './tags/tags.types'
import type { GetUsersQuery } from './users/users.types'

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
    participants: (id: number) => ['gatherings', 'participants', id] as const,
  }

  static readonly users = {
    all: ['users'] as const,
    list: (query: GetUsersQuery) => ['users', 'list', query] as const,
    listAll: () => ['users', 'list-all'] as const,
    detail: (id: number) => ['users', 'detail', id] as const,
  }

  static readonly tags = {
    all: ['tags'] as const,
    list: (query: GetTagsQuery) => ['tags', 'list', query] as const,
    listAll: () => ['tags', 'list-all'] as const,
  }
}
