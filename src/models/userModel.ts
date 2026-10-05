import { apiDelete, apiGet, apiPost } from '@/lib/api'

export type User = { id: number; username: string; role: string; created_at?: string }

export type NewUser = { username: string; password: string; role: string }

export const listUsers = (): Promise<User[]> => apiGet('/users')

export const createUser = (user: NewUser, adminId?: number) =>
  apiPost('/users', { ...user, admin_id: adminId })

export const deleteUser = (id: number, adminId?: number) =>
  apiDelete(`/users/${id}?admin_id=${adminId || ''}`)
