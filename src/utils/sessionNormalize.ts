import type { OrderLine, Player, Session } from '../types';

function toUniqueId(candidate: string, fallback: string, used: Set<string>): string {
  const base = candidate.trim() || fallback;
  let id = base;
  let suffix = 2;
  while (used.has(id)) {
    id = `${base}_${suffix}`;
    suffix += 1;
  }
  used.add(id);
  return id;
}

/** Convert a single order entry (legacy MenuItem or OrderLine) to OrderLine. */
function normalizeOrderLine(raw: unknown, index: number): OrderLine {
  if (!raw || typeof raw !== 'object') {
    const fallback = `line_${index + 1}`;
    return { id: fallback, menuItemId: `item_${index + 1}`, name: '', price: 0, quantity: 1 };
  }
  const o = raw as Record<string, unknown>;
  const rawId = typeof o.id === 'string' ? o.id.trim() : '';
  const rawMenuItemId = typeof o.menuItemId === 'string' ? o.menuItemId.trim() : '';
  const menuItemId = rawMenuItemId || rawId || `item_${index + 1}`;
  const id = rawId || `line_${index + 1}_${menuItemId}`;
  const name = typeof o.name === 'string' ? o.name : '';
  const price = typeof o.price === 'number' && Number.isFinite(o.price) ? o.price : 0;
  const qty = typeof o.quantity === 'number' ? Math.trunc(o.quantity) : 1;
  const quantity = qty >= 1 ? qty : 1;
  return { id, menuItemId, name, price, quantity };
}

/** Normalize orders array (legacy MenuItem[] or OrderLine[]) to OrderLine[]. */
function normalizeOrders(raw: unknown): OrderLine[] {
  if (!Array.isArray(raw)) return [];
  const grouped = new Map<
    string,
    { idCandidate: string; menuItemId: string; name: string; price: number; quantity: number }
  >();

  raw.forEach((item, index) => {
    const line = normalizeOrderLine(item, index);
    if (!line.name.trim()) return;

    // Merge duplicate rows (especially legacy orders where same menu item appears repeatedly).
    const key = `${line.menuItemId}|${line.name}|${line.price}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.quantity += line.quantity;
      return;
    }
    grouped.set(key, {
      idCandidate: line.id,
      menuItemId: line.menuItemId,
      name: line.name,
      price: line.price,
      quantity: line.quantity,
    });
  });

  const usedLineIds = new Set<string>();
  return Array.from(grouped.values()).map((line, index) => {
    const fallbackId = `line_${index + 1}_${line.menuItemId || 'item'}`;
    return {
      id: toUniqueId(line.idCandidate, fallbackId, usedLineIds),
      menuItemId: line.menuItemId || `item_${index + 1}`,
      name: line.name,
      price: line.price,
      quantity: line.quantity >= 1 ? line.quantity : 1,
    };
  });
}

/** Normalize a single player (ensure count and orders are new shape). */
export function normalizePlayer(raw: unknown, fallbackIndex = 0): Player {
  if (!raw || typeof raw !== 'object') {
    return { id: `player_${fallbackIndex + 1}`, name: '', isGuest: false, count: 1, orders: [] };
  }
  const p = raw as Record<string, unknown>;
  const rawId = typeof p.id === 'string' ? p.id.trim() : '';
  const id = rawId || `player_${fallbackIndex + 1}`;
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
  const usedPlayerIds = new Set<string>();
  const players = session.players.map((rawPlayer, index) => {
    const normalized = normalizePlayer(rawPlayer, index);
    const fallbackId = `player_${index + 1}`;
    return {
      ...normalized,
      id: toUniqueId(normalized.id, fallbackId, usedPlayerIds),
    };
  });
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
