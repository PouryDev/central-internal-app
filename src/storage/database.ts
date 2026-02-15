import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from './sqlite';
import { persianToGregorian, toGregorianForDb } from '../utils/date';
import { normalizeSession, normalizePlayer, getTotalPlayerCount } from '../utils/sessionNormalize';
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

function sessionFromRow(row: {
  id: string;
  facilitator_id: string;
  facilitator_name: string;
  hall: string;
  time: string;
  date: string;
  status: string;
  players_json: string;
  shift?: string | null;
}): Session {
  const players = JSON.parse(row.players_json || '[]') as Session['players'];
  const shift = row.shift === 'day' || row.shift === 'night' ? row.shift : 'night';
  const session: Session = {
    id: row.id,
    facilitator: { id: row.facilitator_id, name: row.facilitator_name },
    hall: row.hall,
    time: row.time,
    date: row.date,
    players,
    status: row.status as 'pending' | 'paid',
    shift,
  };
  return normalizeSession(session);
}

export async function getSessionsPage(
  offset: number,
  limit: number,
  filters?: SessionsPageFilters
): Promise<SessionsPageResult> {
  const db = await getDatabase();
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filters?.status && filters.status !== 'all') {
    conditions.push('status = ?');
    params.push(filters.status);
  }
  if (filters?.dateFrom) {
    conditions.push('gregorian_date >= ?');
    params.push(filters.dateFrom);
  }
  if (filters?.dateTo) {
    conditions.push('gregorian_date <= ?');
    params.push(filters.dateTo);
  }
  if (filters?.facilitatorId && filters.facilitatorId !== 'all') {
    conditions.push('facilitator_id = ?');
    params.push(filters.facilitatorId);
  }
  if (filters?.hallId && filters.hallId !== 'all') {
    const halls = await getHalls();
    const hall = halls.find((h) => h.id === filters!.hallId!);
    if (hall) {
      conditions.push('hall = ?');
      params.push(hall.name);
    }
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRow = await db.getFirstAsync<{ cnt: number }>(
    `SELECT COUNT(*) as cnt FROM sessions ${whereClause}`,
    params
  );
  const total = countRow?.cnt ?? 0;

  const rows = await db.getAllAsync<{
    id: string;
    facilitator_id: string;
    facilitator_name: string;
    hall: string;
    time: string;
    date: string;
    status: string;
    players_json: string;
    shift?: string | null;
  }>(
    `SELECT id, facilitator_id, facilitator_name, hall, time, date, status, players_json, shift
     FROM sessions ${whereClause}
     ORDER BY gregorian_date DESC, time DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const sessions = rows.map(sessionFromRow);
  return { sessions, total };
}

export async function getSessionById(id: string): Promise<Session | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    id: string;
    facilitator_id: string;
    facilitator_name: string;
    hall: string;
    time: string;
    date: string;
    status: string;
    players_json: string;
    shift?: string | null;
  }>(
    'SELECT id, facilitator_id, facilitator_name, hall, time, date, status, players_json, shift FROM sessions WHERE id = ?',
    id
  );
  return row ? sessionFromRow(row) : null;
}

export async function getPendingSessionsCount(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ cnt: number }>(
    "SELECT COUNT(*) as cnt FROM sessions WHERE status = 'pending'"
  );
  return row?.cnt ?? 0;
}

function parseNumericId(id: string): number {
  const n = parseInt(id, 10);
  if (!Number.isNaN(n) && n < 1e12) return n;
  const firstNum = id.match(/\d+/)?.[0];
  return firstNum ? parseInt(firstNum, 10) : 0;
}

export async function getMaxSessionNumericId(): Promise<number> {
  const db = await getDatabase();
  const rows = db.getEachAsync<{ id: string }>('SELECT id FROM sessions');
  let max = 0;
  for await (const row of rows) {
    const num = parseNumericId(row.id);
    if (num < 1e12) max = Math.max(max, num);
  }
  return max;
}

export async function getSessionStats(
  filters: SessionsPageFilters,
  facilitators: Facilitator[]
): Promise<SessionStats> {
  const db = await getDatabase();
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (filters?.status && filters.status !== 'all') {
    conditions.push('status = ?');
    params.push(filters.status);
  }
  if (filters?.dateFrom) {
    conditions.push('gregorian_date >= ?');
    params.push(filters.dateFrom);
  }
  if (filters?.dateTo) {
    conditions.push('gregorian_date <= ?');
    params.push(filters.dateTo);
  }
  if (filters?.facilitatorId && filters.facilitatorId !== 'all') {
    conditions.push('facilitator_id = ?');
    params.push(filters.facilitatorId);
  }
  if (filters?.hallId && filters.hallId !== 'all') {
    const halls = await getHalls();
    const hall = halls.find((h) => h.id === filters!.hallId!);
    if (hall) {
      conditions.push('hall = ?');
      params.push(hall.name);
    }
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const countRow = await db.getFirstAsync<{ cnt: number }>(
    `SELECT COUNT(*) as cnt FROM sessions ${whereClause}`,
    params
  );
  const totalSessions = countRow?.cnt ?? 0;

  const facilitatorCounts: Record<string, number> = {};
  facilitators.forEach((f) => (facilitatorCounts[f.id] = 0));
  let totalPlayers = 0;
  const guestType = filters?.guestType ?? 'all';

  const rows = db.getEachAsync<{
    facilitator_id: string;
    players_json: string;
  }>(
    `SELECT facilitator_id, players_json FROM sessions ${whereClause}`,
    params
  );

  for await (const row of rows) {
    const rawPlayers = JSON.parse(row.players_json || '[]') as Session['players'];
    const players = rawPlayers.map(normalizePlayer);
    const sessionCount = getTotalPlayerCount(players);
    for (const p of players) {
      const c = p.count ?? 1;
      if (guestType === 'all') {
        totalPlayers += c;
        facilitatorCounts[row.facilitator_id] =
          (facilitatorCounts[row.facilitator_id] ?? 0) + c;
      } else if (guestType === 'guests' && p.isGuest) {
        totalPlayers += c;
        facilitatorCounts[row.facilitator_id] =
          (facilitatorCounts[row.facilitator_id] ?? 0) + c;
      } else if (guestType === 'non-guests' && !p.isGuest) {
        totalPlayers += c;
        facilitatorCounts[row.facilitator_id] =
          (facilitatorCounts[row.facilitator_id] ?? 0) + c;
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
    totalSessions,
    totalPlayers,
    facilitatorStats,
  };
}

export async function addSession(session: Session): Promise<void> {
  const db = await getDatabase();
  const gregorianDate = toGregorianForDb(session.date) || session.date;
  const shift = session.shift === 'day' || session.shift === 'night' ? session.shift : 'night';
  await db.runAsync(
    `INSERT INTO sessions (id, facilitator_id, facilitator_name, hall, time, date, gregorian_date, status, players_json, shift)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    session.id,
    session.facilitator.id,
    session.facilitator.name,
    session.hall,
    session.time,
    session.date,
    gregorianDate,
    session.status,
    JSON.stringify(session.players),
    shift
  );
}

export async function updateSessionStatus(
  sessionId: string,
  status: 'pending' | 'paid'
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE sessions SET status = ? WHERE id = ?', status, sessionId);
}

export async function updateSession(session: Session): Promise<void> {
  const db = await getDatabase();
  const gregorianDate = toGregorianForDb(session.date) || session.date;
  const shift = session.shift === 'day' || session.shift === 'night' ? session.shift : 'night';
  await db.runAsync(
    `UPDATE sessions SET
       facilitator_id = ?, facilitator_name = ?, hall = ?, time = ?, date = ?, gregorian_date = ?,
       status = ?, players_json = ?, shift = ?
     WHERE id = ?`,
    session.facilitator.id,
    session.facilitator.name,
    session.hall,
    session.time,
    session.date,
    gregorianDate,
    session.status,
    JSON.stringify(session.players),
    shift,
    session.id
  );
}

// facilitators, halls, menu_items, categories - CRUD via SQLite
export async function getCategories(): Promise<Category[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ id: string; name: string; icon: string | null }>(
    'SELECT id, name, icon FROM categories'
  );
  return rows.map((r) => ({ id: r.id, name: r.name, ...(r.icon && { icon: r.icon }) }));
}

export async function setCategories(categories: Category[]): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM categories');
    for (const c of categories) {
      await db.runAsync(
        'INSERT OR REPLACE INTO categories (id, name, icon) VALUES (?, ?, ?)',
        c.id,
        c.name,
        c.icon ?? null
      );
    }
  });
}

export async function addCategory(category: Category): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO categories (id, name, icon) VALUES (?, ?, ?)',
    category.id,
    category.name,
    category.icon ?? null
  );
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<void> {
  const categories = await getCategories();
  const idx = categories.findIndex((c) => c.id === id);
  if (idx >= 0) {
    const updated = { ...categories[idx], ...updates };
    await addCategory(updated);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM categories WHERE id = ?', id);
}

export async function getFacilitators(): Promise<Facilitator[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ id: string; name: string }>(
    'SELECT id, name FROM facilitators'
  );
  return rows;
}

export async function setFacilitators(facilitators: Facilitator[]): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM facilitators');
    for (const f of facilitators) {
      await db.runAsync(
        'INSERT OR REPLACE INTO facilitators (id, name) VALUES (?, ?)',
        f.id,
        f.name
      );
    }
  });
}

export async function addFacilitator(facilitator: Facilitator): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO facilitators (id, name) VALUES (?, ?)',
    facilitator.id,
    facilitator.name
  );
}

export async function updateFacilitator(id: string, updates: Partial<Facilitator>): Promise<void> {
  const facilitators = await getFacilitators();
  const idx = facilitators.findIndex((f) => f.id === id);
  if (idx >= 0) {
    const updated = { ...facilitators[idx], ...updates };
    await addFacilitator(updated);
  }
}

export async function deleteFacilitator(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM facilitators WHERE id = ?', id);
}

export async function getHalls(): Promise<Hall[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ id: string; name: string }>(
    'SELECT id, name FROM halls'
  );
  return rows;
}

export async function setHalls(halls: Hall[]): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM halls');
    for (const h of halls) {
      await db.runAsync(
        'INSERT OR REPLACE INTO halls (id, name) VALUES (?, ?)',
        h.id,
        h.name
      );
    }
  });
}

export async function addHall(hall: Hall): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO halls (id, name) VALUES (?, ?)',
    hall.id,
    hall.name
  );
}

export async function updateHall(id: string, updates: Partial<Hall>): Promise<void> {
  const halls = await getHalls();
  const idx = halls.findIndex((h) => h.id === id);
  if (idx >= 0) {
    const updated = { ...halls[idx], ...updates };
    await addHall(updated);
  }
}

export async function deleteHall(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM halls WHERE id = ?', id);
}

export async function getMenuItems(): Promise<MenuItem[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    price: number;
    category: string;
    description: string | null;
  }>('SELECT id, name, price, category, description FROM menu_items');
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    price: r.price,
    category: r.category,
    ...(r.description && { description: r.description }),
  }));
}

export async function setMenuItems(menuItems: MenuItem[]): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM menu_items');
    for (const m of menuItems) {
      await db.runAsync(
        'INSERT OR REPLACE INTO menu_items (id, name, price, category, description) VALUES (?, ?, ?, ?, ?)',
        m.id,
        m.name,
        m.price,
        m.category,
        m.description ?? null
      );
    }
  });
}

export async function addMenuItem(menuItem: MenuItem): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO menu_items (id, name, price, category, description) VALUES (?, ?, ?, ?, ?)',
    menuItem.id,
    menuItem.name,
    menuItem.price,
    menuItem.category,
    menuItem.description ?? null
  );
}

export async function updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<void> {
  const menuItems = await getMenuItems();
  const idx = menuItems.findIndex((m) => m.id === id);
  if (idx >= 0) {
    const updated = { ...menuItems[idx], ...updates };
    await addMenuItem(updated);
  }
}

export async function deleteMenuItem(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM menu_items WHERE id = ?', id);
}

export async function getSessionsForExport(): Promise<Session[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    facilitator_id: string;
    facilitator_name: string;
    hall: string;
    time: string;
    date: string;
    status: string;
    players_json: string;
    shift?: string | null;
  }>(
    'SELECT id, facilitator_id, facilitator_name, hall, time, date, status, players_json, shift FROM sessions ORDER BY gregorian_date DESC, time DESC'
  );
  return rows.map(sessionFromRow);
}

export async function clearAllData(): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM sessions');
    await db.runAsync('DELETE FROM facilitators');
    await db.runAsync('DELETE FROM halls');
    await db.runAsync('DELETE FROM menu_items');
    await db.runAsync('DELETE FROM categories');
  });
}

export async function clearAsyncStorage(): Promise<void> {
  const keys = Object.values(ASYNC_KEYS);
  await AsyncStorage.multiRemove(keys);
}

/**
 * Fix sessions where gregorian_date was wrong (wrong format or wrong conversion when date was already Gregorian).
 * Recomputes gregorian_date from date using toGregorianForDb.
 */
export async function fixSessionsGregorianDates(): Promise<void> {
  const db = await getDatabase();
  const rows = db.getEachAsync<{ id: string; date: string; gregorian_date: string }>(
    'SELECT id, date, gregorian_date FROM sessions'
  );
  for await (const row of rows) {
    const fixed = toGregorianForDb(row.date);
    if (fixed) {
      await db.runAsync('UPDATE sessions SET gregorian_date = ? WHERE id = ?', fixed, row.id);
    }
  }
}

export async function migrateFromAsyncStorageIfNeeded(): Promise<void> {
  const db = await getDatabase();
  const sessionCount = await db.getFirstAsync<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM sessions'
  );
  if ((sessionCount?.cnt ?? 0) > 0) return;

  const facilitators = await getItem<Facilitator[]>(ASYNC_KEYS.FACILITATORS, []);
  if (facilitators.length === 0) {
    const sessions = await getItem<Session[]>(ASYNC_KEYS.SESSIONS, []);
    if (sessions.length === 0) return;
  }

  const data = {
    sessions: await getItem<Session[]>(ASYNC_KEYS.SESSIONS, []),
    facilitators: await getItem<Facilitator[]>(ASYNC_KEYS.FACILITATORS, []),
    halls: await getItem<Hall[]>(ASYNC_KEYS.HALLS, []),
    menuItems: await getItem<MenuItem[]>(ASYNC_KEYS.MENU_ITEMS, []),
    categories: await getItem<Category[]>(ASYNC_KEYS.CATEGORIES, []),
  };

  if (
    data.sessions.length === 0 &&
    data.facilitators.length === 0 &&
    data.halls.length === 0
  ) {
    return;
  }

  await importDataFromJson(data);
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

export async function importDataFromJson(data: {
  sessions: Session[];
  facilitators: Facilitator[];
  halls: Hall[];
  menuItems: MenuItem[];
  categories: Category[];
}): Promise<void> {
  const db = await getDatabase();
  const BATCH_SIZE = 500;

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM sessions');
    await db.runAsync('DELETE FROM facilitators');
    await db.runAsync('DELETE FROM halls');
    await db.runAsync('DELETE FROM menu_items');
    await db.runAsync('DELETE FROM categories');

    for (const f of data.facilitators) {
      await db.runAsync(
        'INSERT INTO facilitators (id, name) VALUES (?, ?)',
        f.id,
        f.name
      );
    }
    for (const h of data.halls) {
      await db.runAsync(
        'INSERT INTO halls (id, name) VALUES (?, ?)',
        h.id,
        h.name
      );
    }
    for (const m of data.menuItems) {
      await db.runAsync(
        'INSERT INTO menu_items (id, name, price, category, description) VALUES (?, ?, ?, ?, ?)',
        m.id,
        m.name,
        m.price,
        m.category,
        m.description ?? null
      );
    }
    for (const c of data.categories) {
      await db.runAsync(
        'INSERT INTO categories (id, name, icon) VALUES (?, ?, ?)',
        c.id,
        c.name,
        c.icon ?? null
      );
    }

    for (let i = 0; i < data.sessions.length; i += BATCH_SIZE) {
      const batch = data.sessions.slice(i, i + BATCH_SIZE);
      for (const s of batch) {
        const normalized = normalizeSession(s);
        const gregorianDate = toGregorianForDb(normalized.date) || normalized.date;
        const shift = normalized.shift === 'day' || normalized.shift === 'night' ? normalized.shift : 'night';
        await db.runAsync(
          `INSERT INTO sessions (id, facilitator_id, facilitator_name, hall, time, date, gregorian_date, status, players_json, shift)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          normalized.id,
          normalized.facilitator.id,
          normalized.facilitator.name,
          normalized.hall,
          normalized.time,
          normalized.date,
          gregorianDate,
          normalized.status,
          JSON.stringify(normalized.players),
          shift
        );
      }
    }
  });

  await clearAsyncStorage();
}

/**
 * پاک کردن همه داده‌ها و پر کردن با دیتای ماک حجیم برای تست عملکرد
 */
export async function seedWithMockData(): Promise<void> {
  const data = generateLargeSeedData();
  await importDataFromJson(data);
}
