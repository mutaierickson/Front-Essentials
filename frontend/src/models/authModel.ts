import { apiPost } from '@/lib/api'

export type LoginResponse = { id: number; username: string; role: string }

export const login = (username: string, password?: string): Promise<LoginResponse> =>
  apiPost('/login', { username, password })
