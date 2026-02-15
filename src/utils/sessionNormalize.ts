import type { OrderLine, Player, Session } from '../types';

/** Detect legacy MenuItem (has category). */
function isLegacyOrderItem(obj: unknown): obj is { id: string; name: string; price: number; category?: string } {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.name === 'string' && typeof o.price === 'number';
}

/** Convert a single order entry (legacy MenuItem or OrderLine) to OrderLine. */
function normalizeOrderLine(raw: unknown, index: number): OrderLine {
  if (!raw || typeof raw !== 'object') {
    return { id: `line_${index}`, menuItemId: '', name: '', price: 0, quantity: 1 };
  }
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === 'string' ? o.id : `line_${index}`;
  const menuItemId = typeof o.menuItemId === 'string' ? o.menuItemId : (o.id as string) ?? '';
  const name = typeof o.name === 'string' ? o.name : '';
  const price = typeof o.price === 'number' ? o.price : 0;
  const quantity = typeof o.quantity === 'number' && o.quantity >= 1 ? o.quantity : 1;
  return { id, menuItemId: menuItemId || id, name, price, quantity };
}

/** Normalize orders array (legacy MenuItem[] or OrderLine[]) to OrderLine[]. */
function normalizeOrders(raw: unknown): OrderLine[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => normalizeOrderLine(item, i));
}

/** Normalize a single player (ensure count and orders are new shape). */
export function normalizePlayer(raw: unknown): Player {
  if (!raw || typeof raw !== 'object') {
    return { id: '', name: '', isGuest: false, count: 1, orders: [] };
  }
  const p = raw as Record<string, unknown>;
  const id = typeof p.id === 'string' ? p.id : '';
  const name = typeof p.name === 'string' ? p.name : '';
  const isGuest = p.isGuest === true;
  const count =
    typeof p.count === 'number' && p.count >= 1 ? p.count : 1;
  const orders = normalizeOrders(p.orders);
  return { id, name, isGuest, count, orders };
}

/** Normalize session so all players have count and OrderLine[] orders; default shift to 'night'. */
export function normalizeSession(session: Session): Session {
  if (!session || !Array.isArray(session.players)) return session;
  const players = session.players.map(normalizePlayer);
  const shift = session.shift === 'day' || session.shift === 'night' ? session.shift : 'night';
  return { ...session, players, shift };
}

/** Sum of player counts for users (non-guests) and guests. */
export function getPlayerCounts(players: Player[]): { userCount: number; guestCount: number } {
  let userCount = 0;
  let guestCount = 0;
  for (const p of players) {
    const c = typeof p.count === 'number' && p.count >= 1 ? p.count : 1;
    if (p.isGuest) guestCount += c;
    else userCount += c;
  }
  return { userCount, guestCount };
}

/** Total person count (user + guest) for stats. */
export function getTotalPlayerCount(players: Player[]): number {
  const { userCount, guestCount } = getPlayerCounts(players);
  return userCount + guestCount;
}
