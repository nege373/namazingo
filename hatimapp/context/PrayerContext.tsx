import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  prayers: Record<PrayerKey, boolean>;
}

export interface PrayerState {
  dailyRecords: DailyRecord[];
  streak: number;
  totalCompleted: number;
  togglePrayer: (date: string, key: PrayerKey) => Promise<void>;
  getDailyPercent: (date: string) => number;
  getLast7Percents: () => number[];
  getLast30Percents: () => number[];
}

const STORAGE_KEY = '@namaz_state_v1';

const defaultPrayers = (): Record<PrayerKey, boolean> => ({
  fajr: false,
  dhuhr: false,
  asr: false,
  maghrib: false,
  isha: false,
});

const PrayerContext = createContext<PrayerState | undefined>(undefined);

export const PrayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [totalCompleted, setTotalCompleted] = useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { dailyRecords: DailyRecord[]; streak: number; totalCompleted: number };
          setDailyRecords(parsed.dailyRecords ?? []);
          setStreak(parsed.streak ?? 0);
          setTotalCompleted(parsed.totalCompleted ?? 0);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const persist = async (records: DailyRecord[], newStreak: number, newTotal: number) => {
    setDailyRecords(records);
    setStreak(newStreak);
    setTotalCompleted(newTotal);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ dailyRecords: records, streak: newStreak, totalCompleted: newTotal }));
    } catch (e) {
      // ignore
    }
  };

  const findRecord = (records: DailyRecord[], date: string) => records.find((r) => r.date === date);

  const getDailyPercent = (date: string) => {
    const rec = findRecord(dailyRecords, date);
    if (!rec) return 0;
    const vals = Object.values(rec.prayers);
    const done = vals.filter(Boolean).length;
    return Math.round((done / vals.length) * 100);
  };

  const getLast7Percents = () => {
    const res: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      res.push(getDailyPercent(key));
    }
    return res;
  };

  const getLast30Percents = () => {
    const res: number[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      res.push(getDailyPercent(key));
    }
    return res;
  };

  const computeTotalCompleted = (records: DailyRecord[]) => {
    let total = 0;
    records.forEach((r) => {
      total += Object.values(r.prayers).filter(Boolean).length;
    });
    return total;
  };

  const togglePrayer = async (date: string, key: PrayerKey) => {
    const records = [...dailyRecords];
    let rec = findRecord(records, date);
    if (!rec) {
      rec = { date, prayers: defaultPrayers() };
      records.push(rec);
    }
    const prevAll = Object.values(rec.prayers).every(Boolean);
    rec.prayers[key] = !rec.prayers[key];
    const nowAll = Object.values(rec.prayers).every(Boolean);

    // If today just became all completed, increment streak (do not reset on missing days)
    let newStreak = streak;
    if (!prevAll && nowAll) {
      newStreak = streak + 1;
    }

    const newTotal = computeTotalCompleted(records);
    await persist(records, newStreak, newTotal);
  };

  return (
    <PrayerContext.Provider value={{ dailyRecords, streak, totalCompleted, togglePrayer, getDailyPercent, getLast7Percents, getLast30Percents }}>
      {children}
    </PrayerContext.Provider>
  );
};

export const usePrayer = (): PrayerState => {
  const ctx = useContext(PrayerContext);
  if (!ctx) throw new Error('usePrayer must be used within PrayerProvider');
  return ctx;
};

