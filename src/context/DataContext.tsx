import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';
import type {
  Category,
  Facilitator,
  Hall,
  MenuItem,
  Session,
} from '../types';
import type { SessionsPageFilters, SessionsPageResult, SessionStats } from '../storage/database';
import * as db from '../storage/database';

interface DataContextValue {
  facilitators: Facilitator[];
  halls: Hall[];
  menuItems: MenuItem[];
  categories: Category[];
  sessions: Session[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  getPendingSessionsCount: () => Promise<number>;
  getMaxSessionNumericId: () => Promise<number>;
  getSessionsPage: (
    offset: number,
    limit: number,
    filters?: SessionsPageFilters
  ) => Promise<SessionsPageResult>;
  getSessionById: (id: string) => Promise<Session | null>;
  getSessionStats: (
    filters: SessionsPageFilters,
    facilitators: Facilitator[]
  ) => Promise<SessionStats>;
  addSession: (session: Session) => Promise<void>;
  updateSession: (session: Session) => Promise<void>;
  updateSessionStatus: (sessionId: string, status: 'pending' | 'paid') => Promise<void>;
  addFacilitator: (facilitator: Facilitator) => Promise<void>;
  updateFacilitator: (id: string, updates: Partial<Facilitator>) => Promise<void>;
  deleteFacilitator: (id: string) => Promise<void>;
  addMenuItem: (menuItem: MenuItem) => Promise<void>;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  addHall: (hall: Hall) => Promise<void>;
  updateHall: (id: string, updates: Partial<Hall>) => Promise<void>;
  deleteHall: (id: string) => Promise<void>;
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  exportData: () => Promise<string>;
  importData: (jsonString: string) => Promise<boolean>;
  seedWithMockData: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [facilitators, setFacilitators] = useState<Facilitator[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setError(null);
    setLoading(true);
    const load = async (): Promise<void> => {
      await db.migrateFromAsyncStorageIfNeeded();
      await db.fixSessionsGregorianDates();
      const [f, h, m, c] = await Promise.all([
        db.getFacilitators(),
        db.getHalls(),
        db.getMenuItems(),
        db.getCategories(),
      ]);
      if (
        Platform.OS === 'web' &&
        m.length === 0
      ) {
        await db.seedWithMockData();
        const [f2, h2, m2, c2] = await Promise.all([
          db.getFacilitators(),
          db.getHalls(),
          db.getMenuItems(),
          db.getCategories(),
        ]);
        setFacilitators(f2);
        setHalls(h2);
        setMenuItems(m2);
        setCategories(c2);
        setSessions([]);
      } else {
        setFacilitators(f);
        setHalls(h);
        setMenuItems(m);
        setCategories(c);
        setSessions([]);
      }
    };
    try {
      await load();
    } catch (e) {
      try {
        await new Promise((r) => setTimeout(r, 500));
        await load();
      } catch (e2) {
        setError(e2 instanceof Error ? e2.message : 'خطا در بارگذاری داده‌ها');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const getPendingSessionsCount = useCallback(() => db.getPendingSessionsCount(), []);
  const getMaxSessionNumericId = useCallback(() => db.getMaxSessionNumericId(), []);
  const getSessionsPage = useCallback(
    (offset: number, limit: number, filters?: SessionsPageFilters) =>
      db.getSessionsPage(offset, limit, filters),
    []
  );
  const getSessionById = useCallback((id: string) => db.getSessionById(id), []);
  const getSessionStats = useCallback(
    (filters: SessionsPageFilters, facs: Facilitator[]) =>
      db.getSessionStats(filters, facs),
    []
  );

  const addSession = useCallback(async (session: Session) => {
    await db.addSession(session);
    setSessions((prev) => [session, ...prev]);
  }, []);

  const updateSession = useCallback(async (session: Session) => {
    await db.updateSession(session);
    setSessions((prev) =>
      prev.map((s) => (s.id === session.id ? session : s))
    );
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

  const updateFacilitator = useCallback(async (id: string, updates: Partial<Facilitator>) => {
    await db.updateFacilitator(id, updates);
    setFacilitators((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  }, []);

  const deleteFacilitator = useCallback(async (id: string) => {
    await db.deleteFacilitator(id);
    setFacilitators((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const addMenuItem = useCallback(async (menuItem: MenuItem) => {
    await db.addMenuItem(menuItem);
    setMenuItems((prev) => [...prev, menuItem]);
  }, []);

  const updateMenuItem = useCallback(async (id: string, updates: Partial<MenuItem>) => {
    await db.updateMenuItem(id, updates);
    setMenuItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }, []);

  const deleteMenuItem = useCallback(async (id: string) => {
    await db.deleteMenuItem(id);
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const addHall = useCallback(async (hall: Hall) => {
    await db.addHall(hall);
    setHalls((prev) => [...prev, hall]);
  }, []);

  const updateHall = useCallback(async (id: string, updates: Partial<Hall>) => {
    await db.updateHall(id, updates);
    setHalls((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
    );
  }, []);

  const deleteHall = useCallback(async (id: string) => {
    await db.deleteHall(id);
    setHalls((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const addCategory = useCallback(async (category: Category) => {
    await db.addCategory(category);
    setCategories((prev) => [...prev, category]);
  }, []);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    await db.updateCategory(id, updates);
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    await db.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const exportData = useCallback(async () => {
    const sessions = await db.getSessionsForExport();
    return JSON.stringify(
      {
        sessions,
        facilitators,
        halls,
        menuItems,
        categories,
      },
      null,
      2
    );
  }, [facilitators, halls, menuItems, categories]);

  const isValidExportData = (obj: unknown): obj is {
    sessions: Session[];
    facilitators: Facilitator[];
    halls: Hall[];
    menuItems: MenuItem[];
    categories: Category[];
  } => {
    if (!obj || typeof obj !== 'object') return false;
    const o = obj as Record<string, unknown>;
    return (
      Array.isArray(o.sessions) &&
      Array.isArray(o.facilitators) &&
      Array.isArray(o.halls) &&
      Array.isArray(o.menuItems) &&
      Array.isArray(o.categories)
    );
  };

  const importData = useCallback(async (jsonString: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonString) as unknown;
      if (!isValidExportData(parsed)) return false;
      await db.importDataFromJson(parsed);
      await refreshData();
      return true;
    } catch {
      return false;
    }
  }, [refreshData]);

  const seedWithMockData = useCallback(async () => {
    await db.seedWithMockData();
    // بلافاصله لیست‌های کوچک را از همان منبعی که نوشتیم بخوان و state را به‌روز کن
    // تا حتی اگر refreshData بعداً کند باشد یا خطا بده، پنل مدیریت داده نشان بدهد
    const [f, h, m, c] = await Promise.all([
      db.getFacilitators(),
      db.getHalls(),
      db.getMenuItems(),
      db.getCategories(),
    ]);
    setFacilitators(f);
    setHalls(h);
    setMenuItems(m);
    setCategories(c);
    // سپس refresh کامل (برای sessions و همگام‌سازی بقیه state)
    await refreshData();
  }, [refreshData]);

  const value = useMemo<DataContextValue>(
    () => ({
      facilitators,
      halls,
      menuItems,
      categories,
      sessions,
      loading,
      error,
      refreshData,
      getPendingSessionsCount,
      getMaxSessionNumericId,
      getSessionsPage,
      getSessionById,
      getSessionStats,
      addSession,
      updateSession,
      updateSessionStatus,
      addFacilitator,
      updateFacilitator,
      deleteFacilitator,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      addHall,
      updateHall,
      deleteHall,
      addCategory,
      updateCategory,
      deleteCategory,
      exportData,
      importData,
      seedWithMockData,
    }),
    [
      facilitators,
      halls,
      menuItems,
      categories,
      sessions,
      loading,
      error,
      refreshData,
      getPendingSessionsCount,
      getMaxSessionNumericId,
      getSessionsPage,
      getSessionById,
      getSessionStats,
      addSession,
      updateSession,
      updateSessionStatus,
      addFacilitator,
      updateFacilitator,
      deleteFacilitator,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      addHall,
      updateHall,
      deleteHall,
      addCategory,
      updateCategory,
      deleteCategory,
      exportData,
      importData,
      seedWithMockData,
    ]
  );

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
