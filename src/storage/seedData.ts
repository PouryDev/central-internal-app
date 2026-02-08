import type { Facilitator, Hall, MenuItem, Player, Session } from '../types';

export const defaultFacilitators: Facilitator[] = [
  { id: '1', name: 'علی رضایی' },
  { id: '2', name: 'محمد کریمی' },
];

export const defaultHalls: Hall[] = [
  { id: '1', name: 'سالن 1' },
  { id: '2', name: 'سالن 2' },
  { id: '3', name: 'سالن 3' },
  { id: '4', name: 'سالن 4' },
];

export const defaultMenuItems: MenuItem[] = [
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

const defaultPlayers: Player[] = [
  {
    id: '1',
    name: 'پوریا خزاعی',
    isGuest: true,
    orders: [defaultMenuItems[0], defaultMenuItems[2]],
  },
  {
    id: '2',
    name: 'سارا احمدی',
    isGuest: false,
    orders: [defaultMenuItems[1], defaultMenuItems[3]],
  },
];

export const defaultSessions: Session[] = [
  {
    id: '1',
    facilitator: defaultFacilitators[0],
    hall: defaultHalls[0].name,
    time: '20:00',
    date: '1403/01/15',
    players: defaultPlayers,
    status: 'pending',
  },
  {
    id: '2',
    facilitator: defaultFacilitators[1],
    hall: defaultHalls[1].name,
    time: '18:00',
    date: '1403/01/14',
    players: [
      {
        id: '3',
        name: 'رضا محمدی',
        isGuest: false,
        orders: [defaultMenuItems[4], defaultMenuItems[5]],
      },
    ],
    status: 'paid',
  },
];
