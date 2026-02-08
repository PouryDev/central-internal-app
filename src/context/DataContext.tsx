import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type {
  Facilitator,
  Hall,
  MenuItem,
  Session,
} from '../types';
import * as db from '../storage/database';

interface DataContextValue {
  sessions: Session[];
  facilitators: Facilitator[];
  halls: Hall[];
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  addSession: (session: Session) => Promise<void>;
  updateSessionStatus: (sessionId: string, status: 'pending' | 'paid') => Promise<void>;
  addFacilitator: (facilitator: Facilitator) => Promise<void>;
  addMenuItem: (menuItem: MenuItem) => Promise<void>;
  addHall: (hall: Hall) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [facilitators, setFacilitators] = useState<Facilitator[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    try {
      setError(null);
      const [s, f, h, m] = await Promise.all([
        db.getSessions(),
        db.getFacilitators(),
        db.getHalls(),
        db.getMenuItems(),
      ]);
      setSessions(s);
      setFacilitators(f);
      setHalls(h);
      setMenuItems(m);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در بارگذاری داده‌ها');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addSession = useCallback(async (session: Session) => {
    await db.addSession(session);
    setSessions((prev) => [session, ...prev]);
  }, []);

  const updateSessionStatus = useCallback(
    async (sessionId: string, status: 'pending' | 'paid') => {
      await db.updateSessionStatus(sessionId, status);
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, status } : s))
      );
    },
    []
  );

  const addFacilitator = useCallback(async (facilitator: Facilitator) => {
    await db.addFacilitator(facilitator);
    setFacilitators((prev) => [...prev, facilitator]);
  }, []);

  const addMenuItem = useCallback(async (menuItem: MenuItem) => {
    await db.addMenuItem(menuItem);
    setMenuItems((prev) => [...prev, menuItem]);
  }, []);

  const addHall = useCallback(async (hall: Hall) => {
    await db.addHall(hall);
    setHalls((prev) => [...prev, hall]);
  }, []);

  const value: DataContextValue = {
    sessions,
    facilitators,
    halls,
    menuItems,
    loading,
    error,
    refreshData,
    addSession,
    updateSessionStatus,
    addFacilitator,
    addMenuItem,
    addHall,
  };

  return (
    <DataContext.Provider value={value}>{children}</DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within DataProvider');
  }
  return ctx;
}
