export type DashboardPayment = {
  method: string
  total_amount: number
}

export type DashboardLowStock = {
  id: number
  name: string
  stock_quantity: number
  min_stock_level: number
  size: string | null
  color: string | null
}

export type DashboardOrder = {
  id: number
  customer_name: string | null
  total_amount: number
  created_at: string
  username: string | null
  method?: string | null
  receipt_code?: string | null
  close_id?: number | null
  closed_at?: string | null
  voided?: number | boolean | null
}

export type DashboardProduct = {
  name: string
  qty: number
  revenue: number
}

export type DashboardCashier = {
  cashier_name: string
  total_transactions: number
  total_revenue: number
  closed_transactions?: number
  closed_revenue?: number
  open_transactions?: number
}

export type DashboardDayClose = {
  id: number
  user_id: number
  cashier_name: string
  business_date: string
  closed_at: string
  sales_count: number
  sales_total: number
  items_sold: number
  opening_float?: number | null
  cash_sales?: number | null
  cash_refunds?: number | null
  cash_extras?: number | null
  expected_cash?: number | null
  counted_cash?: number | null
  variance?: number | null
}

export type DashboardReturn = {
  id: number
  return_code?: string | null
  type: string
  refund_amount: number
  extra_amount: number
  created_at: string
  receipt_code?: string | null
  username?: string | null
}

export type DashboardData = {
  today: {
    sales: number
    transactions: number
    profit: number
    items_sold: number
    avg_ticket: number
    low_stock: number
    out_of_stock: number
    vat?: number
  }
  shift: {
    sales: number
    transactions: number
    items_sold: number
    avg_ticket: number
  }
  payments: DashboardPayment[]
  shift_payments: DashboardPayment[]
  low_stock: DashboardLowStock[]
  recent_orders: DashboardOrder[]
  my_orders: DashboardOrder[]
  top_products: DashboardProduct[]
  cashiers: DashboardCashier[]
  day_closes: DashboardDayClose[]
  closed_orders: DashboardOrder[]
  last_close: DashboardDayClose | null
  open_shift: {
    sales: number
    transactions: number
    cash_sales?: number
    cash_refunds?: number
    cash_extras?: number
  }
  suggested_float?: number
  returns: {
    count: number
    refunds: number
    extras: number
    recent: DashboardReturn[]
  }
  voids?: {
    count: number
    total: number
    recent: { id: number; reason?: string | null; created_at: string; receipt_code?: string | null; total_amount?: number; username?: string | null }[]
  }
}

export const emptyDashboard: DashboardData = {
  today: { sales: 0, transactions: 0, profit: 0, items_sold: 0, avg_ticket: 0, low_stock: 0, out_of_stock: 0, vat: 0 },
  shift: { sales: 0, transactions: 0, items_sold: 0, avg_ticket: 0 },
  payments: [],
  shift_payments: [],
  low_stock: [],
  recent_orders: [],
  my_orders: [],
  top_products: [],
  cashiers: [],
  day_closes: [],
  closed_orders: [],
  last_close: null,
  open_shift: { sales: 0, transactions: 0, cash_sales: 0, cash_refunds: 0, cash_extras: 0 },
  suggested_float: 0,
  returns: { count: 0, refunds: 0, extras: 0, recent: [] },
  voids: { count: 0, total: 0, recent: [] }
}

