import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Duration,
  Occasion,
  ReuseIntent,
  SessionState,
  VenueType,
  WeddingRole,
} from './types';

interface SessionActions {
  setOccasion: (occasion: Occasion) => void;
  setWeddingRole: (role: WeddingRole) => void;
  setReuseIntent: (intent: ReuseIntent) => void;
  setBudget: (budget: number) => void;
  setLocation: (location: string) => void;
  setEventMonth: (month: string) => void;
  setVenueType: (venue: VenueType) => void;
  setDuration: (duration: Duration) => void;
  reset: () => void;
}

const EMPTY: SessionState = {
  occasion: undefined,
  weddingRole: undefined,
  reuseIntent: undefined,
  budget: undefined,
  location: undefined,
  eventMonth: undefined,
  venueType: undefined,
  duration: undefined,
};

function isWedding(o: Occasion | undefined): boolean {
  return o === 'wedding';
}

export const useSession = create<SessionState & SessionActions>()(
  persist(
    (set) => ({
      ...EMPTY,
      setOccasion: (occasion) =>
        set((prev) => ({
          occasion,
          weddingRole:
            isWedding(prev.occasion) && isWedding(occasion)
              ? prev.weddingRole
              : undefined,
        })),
      setWeddingRole: (weddingRole) => set({ weddingRole }),
      setReuseIntent: (reuseIntent) => set({ reuseIntent }),
      setBudget: (budget) => set({ budget }),
      setLocation: (location) => set({ location }),
      setEventMonth: (eventMonth) => set({ eventMonth }),
      setVenueType: (venueType) => set({ venueType }),
      setDuration: (duration) => set({ duration }),
      reset: () => set({ ...EMPTY }),
    }),
    {
      name: 'zarf-session-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        occasion: s.occasion,
        weddingRole: s.weddingRole,
        reuseIntent: s.reuseIntent,
        budget: s.budget,
        location: s.location,
        eventMonth: s.eventMonth,
        venueType: s.venueType,
        duration: s.duration,
      }),
    },
  ),
);
