export interface Category {
  id: number;
  name: string;
}

export interface FoodItem {
  id: number;
  name: string;
  category_id: number;
  price: number;
  cost: number;
  stock_quantity: number;
  min_stock_level: number;
  size: string | null;
  color: string | null;
  barcode?: string | null;
}

export interface CartItem extends FoodItem {
  cart_id: string;
  quantity: number;
}
