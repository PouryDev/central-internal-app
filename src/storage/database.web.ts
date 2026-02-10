/**
 * Web implementation of database - uses AsyncStorage instead of expo-sqlite.
 * expo-sqlite has known issues on web (Class extends value undefined).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persianToGregorian } from '../utils/date';
import { generateLargeSeedData } from './seedData';
import type {
  Category,
  Facilitator,
  Hall,
  MenuItem,
  Session,
} from '../types';

const ASYNC_KEYS = {
  CATEGORIES: '@mafia_categories',
  FACILITATORS: '@mafia_facilitators',
  HALLS: '@mafia_halls',
  MENU_ITEMS: '@mafia_menuItems',
  SESSIONS: '@mafia_sessions',
};

export interface SessionsPageFilters {
  status?: 'all' | 'pending' | 'paid';
  dateFrom?: string | null;
  dateTo?: string | null;
  facilitatorId?: string;
  hallId?: string;
  guestType?: 'all' | 'guests' | 'non-guests';
}

export interface SessionStats {
  totalSessions: number;
  totalPlayers: number;
  facilitatorStats: { facilitator: Facilitator; count: number }[];
}

export interface SessionsPageResult {
  sessions: Session[];
  total: number;
}

async function getItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return defaultValue;
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getSessionsPage(
  offset: number,
  limit: number,
  filters?: SessionsPageFilters
): Promise<SessionsPageResult> {
  const sessions = await getItem<Session[]>(ASYNC_KEYS.SESSIONS, []);
  const halls = await getItem<Hall[]>(ASYNC_KEYS.HALLS, []);

  let filtered = sessions.filter((s) => {
    if (filters?.status && filters.status !== 'all' && s.status !== filters.status) return false;
    if (filters?.dateFrom) {
      const gregorian = persianToGregorian(s.date) || s.date;
      if (gregorian < filters.dateFrom!) return false;
    }
    if (filters?.dateTo) {
      const gregorian = persianToGregorian(s.date) || s.date;
      if (gregorian > filters.dateTo!) return false;
    }
    if (filters?.facilitatorId && filters.facilitatorId !== 'all' && s.facilitator.id !== filters.facilitatorId)
      return false;
    if (filters?.hallId && filters.hallId !== 'all') {
      const hall = halls.find((h) => h.id === filters!.hallId!);
      if (hall && s.hall !== hall.name) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    const da = persianToGregorian(a.date) || a.date;
    const db = persianToGregorian(b.date) || b.date;
    if (da !== db) return db.localeCompare(da);
    return b.time.localeCompare(a.time);
  });

  const total = filtered.length;
  const page = filtered.slice(offset, offset + limit);
  return { sessions: page, total };
}

export async function getSessionById(id: string): Promise<Session | null> {
  const sessions = await getItem<Session[]>(ASYNC_KEYS.SESSIONS, []);
  return sessions.find((s) => s.id === id) ?? null;
}

export async function getPendingSessionsCount(): Promise<number> {
  const sessions = await getItem<Session[]>(ASYNC_KEYS.SESSIONS, []);
  return sessions.filter((s) => s.status === 'pending').length;
}

function parseNumericId(id: string): number {
  const n = parseInt(id, 10);
  if (!Number.isNaN(n) && n < 1e12) return n;
  const firstNum = id.match(/\d+/)?.[0];
  return firstNum ? parseInt(firstNum, 10) : 0;
}

export async function getMaxSessionNumericId(): Promise<number> {
  const sessions = await getItem<Session[]>(ASYNC_KEYS.SESSIONS, []);
  let max = 0;
  for (const s of sessions) {
    const num = parseNumericId(s.id);
    if (num < 1e12) max = Math.max(max, num);
  }
  return max;
}

export async function getSessionStats(
  filters: SessionsPageFilters,
  facilitators: Facilitator[]
): Promise<SessionStats> {
  const sessions = await getItem<Session[]>(ASYNC_KEYS.SESSIONS, []);
  const halls = await getItem<Hall[]>(ASYNC_KEYS.HALLS, []);

  let filtered = sessions.filter((s) => {
    if (filters?.status && filters.status !== 'all' && s.status !== filters.status) return false;
    if (filters?.dateFrom) {
      const gregorian = persianToGregorian(s.date) || s.date;
      if (gregorian < filters.dateFrom!) return false;
    }
    if (filters?.dateTo) {
      const gregorian = persianToGregorian(s.date) || s.date;
      if (gregorian > filters.dateTo!) return false;
    }
    if (filters?.facilitatorId && filters.facilitatorId !== 'all' && s.facilitator.id !== filters.facilitatorId)
      return false;
    if (filters?.hallId && filters.hallId !== 'all') {
      const hall = halls.find((h) => h.id === filters!.hallId!);
      if (hall && s.hall !== hall.name) return false;
    }
    return true;
  });

  const guestType = filters?.guestType ?? 'all';
  const facilitatorCounts: Record<string, number> = {};
  facilitators.forEach((f) => (facilitatorCounts[f.id] = 0));
  let totalPlayers = 0;

  for (const s of filtered) {
    for (const p of s.players) {
      if (guestType === 'all') {
        totalPlayers++;
        facilitatorCounts[s.facilitator.id] = (facilitatorCounts[s.facilitator.id] ?? 0) + 1;
      } else if (guestType === 'guests' && p.isGuest) {
        totalPlayers++;
        facilitatorCounts[s.facilitator.id] = (facilitatorCounts[s.facilitator.id] ?? 0) + 1;
      } else if (guestType === 'non-guests' && !p.isGuest) {
        totalPlayers++;
        facilitatorCounts[s.facilitator.id] = (facilitatorCounts[s.facilitator.id] ?? 0) + 1;
      }
    }
  }

  const facilitatorStats = facilitators
    .map((facilitator) => ({
      facilitator,
      count: facilitatorCounts[facilitator.id] ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalSessions: filtered.length,
    totalPlayers,
    facilitatorStats,
  };
}

export async function addSession(session: Session): Promise<void> {
  const sessions = await getItem<Session[]>(ASYNC_KEYS.SESSIONS, []);
  sessions.unshift(session);
  await setItem(ASYNC_KEYS.SESSIONS, sessions);
}

export async function updateSessionStatus(
  sessionId: string,
  status: 'pending' | 'paid'
): Promise<void> {
  const sessions = await getItem<Session[]>(ASYNC_KEYS.SESSIONS, []);
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx >= 0) {
    sessions[idx] = { ...sessions[idx], status };
    await setItem(ASYNC_KEYS.SESSIONS, sessions);
  }
}

export async function getCategories(): Promise<Category[]> {
  return getItem<Category[]>(ASYNC_KEYS.CATEGORIES, []);
}

export async function setCategories(categories: Category[]): Promise<void> {
  await setItem(ASYNC_KEYS.CATEGORIES, categories);
}

export async function addCategory(category: Category): Promise<void> {
  const categories = await getItem<Category[]>(ASYNC_KEYS.CATEGORIES, []);
  const idx = categories.findIndex((c) => c.id === category.id);
  if (idx >= 0) categories[idx] = category;
  else categories.push(category);
  await setItem(ASYNC_KEYS.CATEGORIES, categories);
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<void> {
  const categories = await getCategories();
  const idx = categories.findIndex((c) => c.id === id);
  if (idx >= 0) {
    await addCategory({ ...categories[idx], ...updates });
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const categories = await getItem<Category[]>(ASYNC_KEYS.CATEGORIES, []);
  await setItem(ASYNC_KEYS.CATEGORIES, categories.filter((c) => c.id !== id));
}

export async function getFacilitators(): Promise<Facilitator[]> {
  return getItem<Facilitator[]>(ASYNC_KEYS.FACILITATORS, []);
}

export async function setFacilitators(facilitators: Facilitator[]): Promise<void> {
  await setItem(ASYNC_KEYS.FACILITATORS, facilitators);
}

export async function addFacilitator(facilitator: Facilitator): Promise<void> {
  const facilitators = await getItem<Facilitator[]>(ASYNC_KEYS.FACILITATORS, []);
  const idx = facilitators.findIndex((f) => f.id === facilitator.id);
  if (idx >= 0) facilitators[idx] = facilitator;
  else facilitators.push(facilitator);
  await setItem(ASYNC_KEYS.FACILITATORS, facilitators);
}

export async function updateFacilitator(id: string, updates: Partial<Facilitator>): Promise<void> {
  const facilitators = await getFacilitators();
  const idx = facilitators.findIndex((f) => f.id === id);
  if (idx >= 0) {
    await addFacilitator({ ...facilitators[idx], ...updates });
  }
}

export async function deleteFacilitator(id: string): Promise<void> {
  const facilitators = await getItem<Facilitator[]>(ASYNC_KEYS.FACILITATORS, []);
  await setItem(ASYNC_KEYS.FACILITATORS, facilitators.filter((f) => f.id !== id));
}

export async function getHalls(): Promise<Hall[]> {
  return getItem<Hall[]>(ASYNC_KEYS.HALLS, []);
}

export async function setHalls(halls: Hall[]): Promise<void> {
  await setItem(ASYNC_KEYS.HALLS, halls);
}

export async function addHall(hall: Hall): Promise<void> {
  const halls = await getItem<Hall[]>(ASYNC_KEYS.HALLS, []);
  const idx = halls.findIndex((h) => h.id === hall.id);
  if (idx >= 0) halls[idx] = hall;
  else halls.push(hall);
  await setItem(ASYNC_KEYS.HALLS, halls);
}

export async function updateHall(id: string, updates: Partial<Hall>): Promise<void> {
  const halls = await getHalls();
  const idx = halls.findIndex((h) => h.id === id);
  if (idx >= 0) {
    await addHall({ ...halls[idx], ...updates });
  }
}

export async function deleteHall(id: string): Promise<void> {
  const halls = await getItem<Hall[]>(ASYNC_KEYS.HALLS, []);
  await setItem(ASYNC_KEYS.HALLS, halls.filter((h) => h.id !== id));
}

export async function getMenuItems(): Promise<MenuItem[]> {
  return getItem<MenuItem[]>(ASYNC_KEYS.MENU_ITEMS, []);
}

export async function setMenuItems(menuItems: MenuItem[]): Promise<void> {
  await setItem(ASYNC_KEYS.MENU_ITEMS, menuItems);
}

export async function addMenuItem(menuItem: MenuItem): Promise<void> {
  const items = await getItem<MenuItem[]>(ASYNC_KEYS.MENU_ITEMS, []);
  const idx = items.findIndex((m) => m.id === menuItem.id);
  if (idx >= 0) items[idx] = menuItem;
  else items.push(menuItem);
  await setItem(ASYNC_KEYS.MENU_ITEMS, items);
}

export async function updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<void> {
  const items = await getMenuItems();
  const idx = items.findIndex((m) => m.id === id);
  if (idx >= 0) {
    await addMenuItem({ ...items[idx], ...updates });
  }
}

export async function deleteMenuItem(id: string): Promise<void> {
  const items = await getItem<MenuItem[]>(ASYNC_KEYS.MENU_ITEMS, []);
  await setItem(ASYNC_KEYS.MENU_ITEMS, items.filter((m) => m.id !== id));
}

export async function getSessionsForExport(): Promise<Session[]> {
  const sessions = await getItem<Session[]>(ASYNC_KEYS.SESSIONS, []);
  return [...sessions].sort((a, b) => {
    const da = persianToGregorian(a.date) || a.date;
    const db = persianToGregorian(b.date) || b.date;
    if (da !== db) return db.localeCompare(da);
    return b.time.localeCompare(a.time);
  });
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(ASYNC_KEYS));
}

export async function clearAsyncStorage(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(ASYNC_KEYS));
}

export async function migrateFromAsyncStorageIfNeeded(): Promise<void> {
  // On web we use AsyncStorage directly - no migration from SQLite needed
}

export async function fixSessionsGregorianDates(): Promise<void> {
  // Web has no gregorian_date column; filtering uses persianToGregorian(s.date) on the fly
}

export async function importDataFromJson(data: {
  sessions: Session[];
  facilitators: Facilitator[];
  halls: Hall[];
  menuItems: MenuItem[];
  categories: Category[];
}): Promise<void> {
  await setItem(ASYNC_KEYS.FACILITATORS, data.facilitators);
  await setItem(ASYNC_KEYS.HALLS, data.halls);
  await setItem(ASYNC_KEYS.MENU_ITEMS, data.menuItems);
  await setItem(ASYNC_KEYS.CATEGORIES, data.categories);
  await setItem(ASYNC_KEYS.SESSIONS, data.sessions);
}

/** وب: حداکثر ~۱٬۰۰۰ سانس به‌خاطر محدودیت localStorage (~۵MB) */
const WEB_SESSION_LIMIT = 1000;

export async function seedWithMockData(): Promise<void> {
  const data = generateLargeSeedData(WEB_SESSION_LIMIT);
  await importDataFromJson(data);
}
