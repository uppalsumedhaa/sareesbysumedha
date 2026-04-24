import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AccessoriesVibe,
  BlousePreference,
  ColorAnalysis,
  DrapeStyle,
  Duration,
  Mood,
  Occasion,
  ReuseIntent,
  SessionState,
  TradContempLevel,
  VenueType,
  VetoColor,
  WeddingRole,
} from './types';

export const MAX_MOODS = 3;

interface SessionActions {
  setOccasion: (occasion: Occasion) => void;
  setWeddingRole: (role: WeddingRole) => void;
  setReuseIntent: (intent: ReuseIntent) => void;
  setBudget: (budget: number) => void;
  setLocation: (location: string) => void;
  setEventMonth: (month: string) => void;
  setVenueType: (venue: VenueType) => void;
  setDuration: (duration: Duration) => void;
  toggleMood: (mood: Mood) => void;
  setTradContempLevel: (level: TradContempLevel) => void;
  toggleColorVeto: (color: VetoColor) => void;
  setColorAnalysis: (result: ColorAnalysis) => void;
  clearColorAnalysis: () => void;
  setBlousePreference: (pref: BlousePreference) => void;
  setDrapeStyle: (style: DrapeStyle) => void;
  setAccessoriesVibe: (vibe: AccessoriesVibe) => void;
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
  moods: undefined,
  tradContempLevel: undefined,
  colorVetoes: undefined,
  undertone: undefined,
  contrast: undefined,
  suggestedPalette: undefined,
  blousePreference: undefined,
  drapeStyle: undefined,
  accessoriesVibe: undefined,
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
      toggleMood: (mood) =>
        set((prev) => {
          const current = prev.moods ?? [];
          if (current.includes(mood)) {
            return { moods: current.filter((m) => m !== mood) };
          }
          if (current.length >= MAX_MOODS) {
            return {};
          }
          return { moods: [...current, mood] };
        }),
      setTradContempLevel: (tradContempLevel) => set({ tradContempLevel }),
      toggleColorVeto: (color) =>
        set((prev) => {
          const current = prev.colorVetoes ?? [];
          if (current.includes(color)) {
            return { colorVetoes: current.filter((c) => c !== color) };
          }
          return { colorVetoes: [...current, color] };
        }),
      setColorAnalysis: ({ undertone, contrast, palette }) =>
        set({ undertone, contrast, suggestedPalette: palette }),
      clearColorAnalysis: () =>
        set({
          undertone: undefined,
          contrast: undefined,
          suggestedPalette: undefined,
        }),
      setBlousePreference: (blousePreference) => set({ blousePreference }),
      setDrapeStyle: (drapeStyle) => set({ drapeStyle }),
      setAccessoriesVibe: (accessoriesVibe) => set({ accessoriesVibe }),
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
        moods: s.moods,
        tradContempLevel: s.tradContempLevel,
        colorVetoes: s.colorVetoes,
        undertone: s.undertone,
        contrast: s.contrast,
        suggestedPalette: s.suggestedPalette,
        blousePreference: s.blousePreference,
        drapeStyle: s.drapeStyle,
        accessoriesVibe: s.accessoriesVibe,
      }),
    },
  ),
);
