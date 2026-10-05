import { apiGet, apiPost } from '@/lib/api'

export type Intake = {
  id: number
  product_id: number
  quantity: number
  unit_cost: number
  note?: string | null
  created_at: string
  name?: string | null
  size?: string | null
  color?: string | null
  username?: string | null
}

export type NewIntake = {
  user_id: number
  product_id: number
  quantity: number
  unit_cost: number
  note: string
}

export const listIntakes = (): Promise<Intake[]> => apiGet('/stock-intakes')

export const createIntake = (intake: NewIntake) => apiPost('/stock-intakes', intake)
