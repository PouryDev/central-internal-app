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

export interface Player {
  id: string;
  name: string;
  isGuest: boolean;
  orders: MenuItem[];
}

export interface Session {
  id: string;
  facilitator: Facilitator;
  hall: string;
  time: string;
  date: string;
  players: Player[];
  status: 'pending' | 'paid';
}

export interface Hall {
  id: string;
  name: string;
}
