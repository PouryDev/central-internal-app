export interface Facilitator {
  id: string;
  name: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'hot-drink' | 'cold-drink' | 'snack';
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

export const facilitators: Facilitator[] = [
  { id: '1', name: 'علی رضایی' },
  { id: '2', name: 'محمد کریمی' },
];

export const halls: Hall[] = [
  { id: '1', name: 'سالن 1' },
  { id: '2', name: 'سالن 2' },
  { id: '3', name: 'سالن 3' },
  { id: '4', name: 'سالن 4' },
];

export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'قهوه اسپرسو',
    price: 120000,
    category: 'hot-drink',
    description: 'قهوه اسپرسو خالص و تازه',
  },
  {
    id: '2',
    name: 'چای ماسالا',
    price: 150000,
    category: 'hot-drink',
    description: 'چای هندی با ادویه‌های مخصوص',
  },
  {
    id: '3',
    name: 'سیب‌زمینی ویژه',
    price: 200000,
    category: 'snack',
    description: 'سیب‌زمینی سرخ شده با سس مخصوص',
  },
  {
    id: '4',
    name: 'آبمیوه طبیعی',
    price: 100000,
    category: 'cold-drink',
    description: 'آبمیوه تازه و طبیعی',
  },
  {
    id: '5',
    name: 'کاپوچینو',
    price: 140000,
    category: 'hot-drink',
    description: 'کاپوچینو با فوم شیر',
  },
  {
    id: '6',
    name: 'پاپ کورن',
    price: 80000,
    category: 'snack',
    description: 'پاپ کورن تازه و داغ',
  },
];

export const players: Player[] = [
  {
    id: '1',
    name: 'پوریا خزاعی',
    isGuest: true,
    orders: [menuItems[0], menuItems[2]],
  },
  {
    id: '2',
    name: 'سارا احمدی',
    isGuest: false,
    orders: [menuItems[1], menuItems[3]],
  },
];

export const sessions: Session[] = [
  {
    id: '1',
    facilitator: facilitators[0],
    hall: halls[0].name,
    time: '20:00',
    date: '1403/01/15',
    players: players,
    status: 'pending',
  },
  {
    id: '2',
    facilitator: facilitators[1],
    hall: halls[1].name,
    time: '18:00',
    date: '1403/01/14',
    players: [
      {
        id: '3',
        name: 'رضا محمدی',
        isGuest: false,
        orders: [menuItems[4], menuItems[5]],
      },
    ],
    status: 'paid',
  },
];

