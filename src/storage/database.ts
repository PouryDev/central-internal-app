import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Facilitator,
  Hall,
  MenuItem,
  Session,
} from '../types';
import {
  defaultFacilitators,
  defaultHalls,
  defaultMenuItems,
  defaultSessions,
} from './seedData';

const KEYS = {
  FACILITATORS: '@mafia_facilitators',
  HALLS: '@mafia_halls',
  MENU_ITEMS: '@mafia_menuItems',
  SESSIONS: '@mafia_sessions',
};

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

export async function getFacilitators(): Promise<Facilitator[]> {
  const data = await getItem(KEYS.FACILITATORS, defaultFacilitators);
  if (data.length === 0) {
    await setFacilitators(defaultFacilitators);
    return defaultFacilitators;
  }
  return data;
}

export async function setFacilitators(facilitators: Facilitator[]): Promise<void> {
  await setItem(KEYS.FACILITATORS, facilitators);
}

export async function getHalls(): Promise<Hall[]> {
  const data = await getItem(KEYS.HALLS, defaultHalls);
  if (data.length === 0) {
    await setHalls(defaultHalls);
    return defaultHalls;
  }
  return data;
}

export async function setHalls(halls: Hall[]): Promise<void> {
  await setItem(KEYS.HALLS, halls);
}

export async function getMenuItems(): Promise<MenuItem[]> {
  const data = await getItem(KEYS.MENU_ITEMS, defaultMenuItems);
  if (data.length === 0) {
    await setMenuItems(defaultMenuItems);
    return defaultMenuItems;
  }
  return data;
}

export async function setMenuItems(menuItems: MenuItem[]): Promise<void> {
  await setItem(KEYS.MENU_ITEMS, menuItems);
}

export async function getSessions(): Promise<Session[]> {
  const data = await getItem(KEYS.SESSIONS, defaultSessions);
  if (data.length === 0) {
    await setSessions(defaultSessions);
    return defaultSessions;
  }
  return data;
}

export async function setSessions(sessions: Session[]): Promise<void> {
  await setItem(KEYS.SESSIONS, sessions);
}

export async function addSession(session: Session): Promise<void> {
  const sessions = await getSessions();
  sessions.unshift(session);
  await setSessions(sessions);
}

export async function updateSessionStatus(
  sessionId: string,
  status: 'pending' | 'paid'
): Promise<void> {
  const sessions = await getSessions();
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx >= 0) {
    sessions[idx] = { ...sessions[idx], status };
    await setSessions(sessions);
  }
}

export async function addFacilitator(facilitator: Facilitator): Promise<void> {
  const facilitators = await getFacilitators();
  facilitators.push(facilitator);
  await setFacilitators(facilitators);
}

export async function addMenuItem(menuItem: MenuItem): Promise<void> {
  const menuItems = await getMenuItems();
  menuItems.push(menuItem);
  await setMenuItems(menuItems);
}

export async function addHall(hall: Hall): Promise<void> {
  const halls = await getHalls();
  halls.push(hall);
  await setHalls(halls);
}
