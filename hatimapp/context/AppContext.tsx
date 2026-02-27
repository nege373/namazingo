import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type DailyRecord = {
  date: string; // YYYY-MM-DD
  prayers: Record<PrayerKey, boolean>;
  qadha: Record<PrayerKey, number>;
  actions: {
    duaCount: number;
    nafileCount: number;
    quranMinutes: number;
    salawatCount: number;
  };
  xpEarnedToday: number;
};

export type User = {
  name?: string;
  theme?: 'light' | 'dark';
  totalXP: number;
  level: number;
  streak: number;
  perfectDays: number;
  badges: string[];
};

type AppState = {
  user: User;
  dailyRecords: DailyRecord[];
  leaderboardDemo: { name: string; xp: number; level: number; badge?: string }[];
  togglePrayer: (date: string, key: PrayerKey) => Promise<void>;
  undoPrayer: (date: string, key: PrayerKey) => Promise<void>;
  addQadha: (date: string, key: PrayerKey, count: number) => Promise<void>;
  performAction: (date: string, action: keyof DailyRecord['actions'], amount?: number) => Promise<void>;
  getDailyPercent: (date: string) => number;
  getLast7Percents: () => number[];
  getLast30Percents: () => number[];
};

const STORAGE_KEY = '@namaz_duolingo_state_v1';

const defaultRecord = (date: string): DailyRecord => ({
  date,
  prayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false },
  qadha: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
  actions: { duaCount: 0, nafileCount: 0, quranMinutes: 0, salawatCount: 0 },
  xpEarnedToday: 0,
});

const defaultUser = (): User => ({ name: undefined, theme: 'light', totalXP: 0, level: 1, streak: 0, perfectDays: 0, badges: [] });

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(defaultUser());
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [leaderboardDemo, setLeaderboardDemo] = useState<AppState['leaderboardDemo']>([
    { name: 'Ali', xp: 1200, level: 5, badge: '🌟' },
    { name: 'Fatma', xp: 900, level: 4, badge: '🏅' },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setUser(parsed.user ?? defaultUser());
          setDailyRecords(parsed.dailyRecords ?? []);
          setLeaderboardDemo(parsed.leaderboardDemo ?? []);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const persist = async (u: User, records: DailyRecord[], lb = leaderboardDemo) => {
    setUser(u);
    setDailyRecords(records);
    setLeaderboardDemo(lb);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u, dailyRecords: records, leaderboardDemo: lb }));
    } catch (e) {
      // ignore
    }
  };

  const findRecord = (date: string) => dailyRecords.find((d) => d.date === date);

  const calcLevel = (totalXP: number) => Math.floor(totalXP / 300) + 1;

  const calcXPForPrayer = () => 20;

  const togglePrayer = async (date: string, key: PrayerKey) => {
    const records = [...dailyRecords];
    let rec = records.find((r) => r.date === date);
    if (!rec) {
      rec = defaultRecord(date);
      records.push(rec);
    }
    if (rec.prayers[key]) return; // already marked
    rec.prayers[key] = true;
    const xpGain = calcXPForPrayer();
    rec.xpEarnedToday += xpGain;
    const newUser = { ...user, totalXP: user.totalXP + xpGain };
    newUser.level = calcLevel(newUser.totalXP);
    // if all prayers now true -> perfect day logic
    if (Object.values(rec.prayers).every(Boolean)) {
      newUser.streak = user.streak + 1;
      newUser.perfectDays = user.perfectDays + 1;
      rec.xpEarnedToday += 50; // bonus
      newUser.totalXP += 50;
      newUser.level = calcLevel(newUser.totalXP);
    }
    await persist(newUser, records);
  };

  const undoPrayer = async (date: string, key: PrayerKey) => {
    const records = [...dailyRecords];
    const rec = records.find((r) => r.date === date);
    if (!rec) return;
    if (!rec.prayers[key]) return;
    rec.prayers[key] = false;
    // reduce xp (best effort, not exact)
    const xpLoss = calcXPForPrayer();
    const newUser = { ...user, totalXP: Math.max(0, user.totalXP - xpLoss) };
    newUser.level = calcLevel(newUser.totalXP);
    await persist(newUser, records);
  };

  const addQadha = async (date: string, key: PrayerKey, count: number) => {
    const records = [...dailyRecords];
    let rec = records.find((r) => r.date === date);
    if (!rec) {
      rec = defaultRecord(date);
      records.push(rec);
    }
    rec.qadha[key] = (rec.qadha[key] || 0) + count;
    // small XP per qadha? not by default
    await persist(user, records);
  };

  const performAction = async (date: string, action: keyof DailyRecord['actions'], amount = 1) => {
    const records = [...dailyRecords];
    let rec = records.find((r) => r.date === date);
    if (!rec) {
      rec = defaultRecord(date);
      records.push(rec);
    }
    rec.actions[action] = (rec.actions[action] || 0) + amount;
    // XP rules
    let xpGain = 0;
    if (action === 'duaCount') xpGain = 5 * amount;
    if (action === 'nafileCount') xpGain = 15 * amount;
    if (action === 'quranMinutes') xpGain = 2 * amount;
    if (action === 'salawatCount') xpGain = Math.floor(amount / 100) * 10;
    rec.xpEarnedToday += xpGain;
    const newUser = { ...user, totalXP: user.totalXP + xpGain };
    newUser.level = calcLevel(newUser.totalXP);
    await persist(newUser, records);
  };

  const getDailyPercent = (date: string) => {
    const rec = findRecord(date);
    if (!rec) return 0;
    const done = Object.values(rec.prayers).filter(Boolean).length;
    return Math.round((done / 5) * 100);
  };

  const getLast7Percents = () => {
    const out: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push(getDailyPercent(key));
    }
    return out;
  };

  const getLast30Percents = () => {
    const out: number[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push(getDailyPercent(key));
    }
    return out;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        dailyRecords,
        leaderboardDemo,
        togglePrayer,
        undoPrayer,
        addQadha,
        performAction,
        getDailyPercent,
        getLast7Percents,
        getLast30Percents,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

