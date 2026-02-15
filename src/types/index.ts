export interface Facilitator {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
}

/** A single order line: menu item with quantity (snapshot name/price for display). */
export interface OrderLine {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Player {
  id: string;
  name: string;
  isGuest: boolean;
  /** Number of persons this player represents (default 1). */
  count?: number;
  orders: OrderLine[];
}

export interface Session {
  id: string;
  facilitator: Facilitator;
  hall: string;
  time: string;
  date: string;
  players: Player[];
  status: 'pending' | 'paid';
  /** Day or night session; default 'night' for legacy data. */
  shift?: 'day' | 'night';
}

export interface Hall {
  id: string;
  name: string;
}
