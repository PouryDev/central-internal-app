import type {
  Category,
  Facilitator,
  Hall,
  MenuItem,
  Player,
  Session,
} from '../types';

/**
 * دیتای ماک حجیم برای تست عملکرد اپلیکیشن با حجم زیاد داده
 * ۱۰۰٬۰۰۰ سانس، ۵۰ گرداننده، ۳۰ سالن، ~۱۳۰ آیتم منو در ۱۲ دسته‌بندی
 * هر سانس ۱۰–۱۵ نفر، بخشی با سفارش و بخشی بی‌سفارش
 * مجموعاً ~۱٬۲۵۰٬۰۰۰ بازیکن در سانس‌ها
 */

const PERSIAN_FIRST_NAMES = [
  'علی', 'محمد', 'حسین', 'رضا', 'مهدی', 'امیر', 'احمد', 'سعید', 'اکبر', 'مسعود',
  'مریم', 'زهرا', 'فاطمه', 'زینب', 'مریم', 'سارا', 'نرگس', 'ملیکا', 'الهام', 'نیلوفر',
  'امین', 'سینا', 'پویا', 'آرش', 'بهزاد', 'کیان', 'سامان', 'دانیال', 'امیرحسین', 'سپهر',
];

const PERSIAN_LAST_NAMES = [
  'احمدی', 'محمدی', 'رضایی', 'حسینی', 'کریمی', 'موسوی', 'حیدری', 'حسن‌زاده', 'اکبری', 'نوری',
  'جمالی', 'صادقی', 'توکلی', 'کاظمی', 'زارعی', 'مرادی', 'فروتن', 'میرزایی', 'رستمی', 'ملکی',
];

const HALL_NAMES = [
  'سالن اصلی', 'سالن VIP', 'سالن شرقی', 'سالن غربی', 'سالن شمالی', 'سالن جنوبی',
  'تابستان', 'زمستان', 'بهار', 'پاییز', 'آسمان', 'دریا', 'کوه', 'جنگل',
  'اتاق ۱', 'اتاق ۲', 'اتاق ۳', 'اتاق ۴', 'اتاق ۵', 'اتاق ۶',
  'بوفه', 'پشتبام', 'حیاط', 'آلاچیق', 'گلخانه', 'پاسیو',
  'طبقه اول', 'طبقه دوم', 'سالن A', 'سالن B',
];

const MENU_CATEGORIES = [
  'نوشیدنی گرم', 'نوشیدنی سرد', 'قهوه', 'دسر', 'ساندویچ', 'پیتزا',
  'برگر', 'سالاد', 'صبحانه', 'میوه', 'تنقلات', 'سوپ',
];

const MENU_ITEMS_BY_CATEGORY: Record<string, string[]> = {
  'نوشیدنی گرم': [
    'چای', 'قهوه اسپرسو', 'کاپوچینو', 'لاته', 'هات چاکلت', 'چای سبز', 'دمنوش بابونه', 'دمنوش نعناع',
    'چای دارچین', 'چای زنجبیل', 'ماچا', 'هات مرون',
  ],
  'نوشیدنی سرد': [
    'آب میوه', 'شیک شکلات', 'موهیتو', 'سودا', 'آیس لاته', 'اسموتی', 'شیرموز', 'دوغ',
    'لیموناد', 'آیس موکا', 'فراپوچینو', 'اسموتی توت',
  ],
  'قهوه': [
    'اسپرسو', 'امریکانو', 'موکا', 'وایت', 'فلت وایت', 'فرانسه', 'ترک', 'اسپرسو دبل',
    'ریستretto', 'لانگو', 'ماکیاتو', 'کورتادو',
  ],
  'دسر': [
    'تیرامیسو', 'براونی', 'کیک شکلات', 'بستنی', 'پنکیک', 'وافل', 'چیزکیک', 'مافین',
    'پای سیب', 'کرم کارامل', 'پودینگ', 'بیسکوئیت',
  ],
  'ساندویچ': [
    'تن ماهی', 'مرغ', 'گوشت', 'پنیر', 'سبزیجات', 'ژامبون', 'سوسیج', 'کالباس',
    'ساندویچ کلوب', 'پنیر پیتزا', 'مرغ باربیکیو', 'سبزیجات گریل',
  ],
  'پیتزا': [
    'مارگاریتا', 'پپرونی', 'چهار فصل', 'قارچ', 'سبزیجات', 'مرغ', 'مخصوص',
    'پیتزا تن ماهی', 'پیتزا مرغ و قارچ', 'پیتزا پپرونی دبل', 'پیتزا مکزیکی', 'پیتزا سبزیجات گریل',
  ],
  'برگر': [
    'همبرگر', 'چیزبرگر', 'دبل برگر', 'مرغ برگر', 'برگر قارچ',
    'برگر پنیر دبل', 'برگر بیکن', 'برگر گیاهی', 'برگر مخصوص', 'مینی برگر',
  ],
  'سالاد': [
    'سزار', 'یونانی', 'سبزیجات', 'تن ماهی', 'ساده',
    'سالاد مرغ', 'سالاد کلم', 'سالاد پاستا', 'سالاد قیصری', 'سالاد تبوله',
  ],
  'صبحانه': [
    'املت', 'نیمرو', 'پنکیک', 'صبحانه ایرانی', 'او ملت',
    'املت قارچ', 'املت پنیر', 'فرنی', 'حلیم', 'نیمرو با نان',
  ],
  'میوه': [
    'سالاد میوه', 'سیب', 'موز', 'پرتقال', 'انگور', 'هندوانه',
    'انار', 'انبه', 'توت فرنگی', 'کیوی', 'آناناس', 'خربزه',
  ],
  'تنقلات': [
    'سیب زمینی سرخ', 'پنیر و زیتون', 'نان تست', 'کراکر', 'پاپ کورن',
    'رویه سیب زمینی', 'چیپس', 'بادام زمینی', 'ذرت بوداده', 'پنیر دلمه',
  ],
  'سوپ': [
    'سوپ جو', 'سوپ مرغ', 'سوپ سبزیجات', 'سوپ گوجه',
    'سوپ عدس', 'سوپ جو دوسر', 'سوپ قارچ', 'آش رشته', 'سوپ تمیز',
  ],
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSessionId(s: number): string {
  return `ses_${s}_${Math.random().toString(36).slice(2, 10)}`;
}

function generatePlayerId(s: number, p: number): string {
  return `pl_${s}_${p}_${Math.random().toString(36).slice(2, 8)}`;
}

export interface SeedDataResult {
  sessions: Session[];
  facilitators: Facilitator[];
  halls: Hall[];
  menuItems: MenuItem[];
  categories: Category[];
}

export function generateLargeSeedData(sessionCount?: number): SeedDataResult {
  const categories: Category[] = MENU_CATEGORIES.map((name, i) => ({
    id: `cat_${i + 1}`,
    name,
    icon: null,
  }));

  const menuItems: MenuItem[] = [];
  let menuId = 1;
  for (const [catName, items] of Object.entries(MENU_ITEMS_BY_CATEGORY)) {
    const cat = categories.find((c) => c.name === catName);
    if (!cat) continue;
    for (const itemName of items) {
      menuItems.push({
        id: `menu_${menuId}`,
        name: itemName,
        price: randomInt(15, 120) * 1000,
        category: cat.id,
        description: null,
      });
      menuId++;
    }
  }

  const facilitators: Facilitator[] = Array.from({ length: 50 }, (_, i) => ({
    id: `fac_${i + 1}`,
    name: `${randomPick(PERSIAN_FIRST_NAMES)} ${randomPick(PERSIAN_LAST_NAMES)}`,
  }));

  const halls: Hall[] = HALL_NAMES.map((name, i) => ({
    id: `hall_${i + 1}`,
    name,
  }));

  const sessions: Session[] = [];

  // تولید تاریخ‌های شمسی از ۱۴۰۲/۰۱/۰۱ تا ۱۴۰۴/۰۴/۰۹
  const startYear = 1402;
  const endYear = 1404;
  const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

  const SESSION_COUNT = sessionCount ?? 100000;

  for (let s = 0; s < SESSION_COUNT; s++) {
    const year = randomInt(startYear, endYear);
    const month = randomInt(1, 12);
    const day = randomInt(1, 28);
    const date = `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
    const time = randomPick(times);
    const facilitator = randomPick(facilitators);
    const hall = randomPick(halls);

    const playerCount = randomInt(10, 15);
    const players: Player[] = [];

    for (let p = 0; p < playerCount; p++) {
      const orderCount = Math.random() < 0.45 ? 0 : randomInt(1, 3);
      const orders: MenuItem[] = [];
      for (let o = 0; o < orderCount; o++) {
        orders.push(randomPick(menuItems));
      }
      players.push({
        id: generatePlayerId(s, p),
        name: `${randomPick(PERSIAN_FIRST_NAMES)} ${randomPick(PERSIAN_LAST_NAMES)}`,
        isGuest: Math.random() < 0.2,
        orders,
      });
    }

    sessions.push({
      id: generateSessionId(s),
      facilitator,
      hall: hall.name,
      time,
      date,
      players,
      status: Math.random() < 0.4 ? 'pending' : 'paid',
    });
  }

  return {
    sessions,
    facilitators,
    halls,
    menuItems,
    categories,
  };
}
