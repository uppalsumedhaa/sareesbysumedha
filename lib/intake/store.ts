// Single source of truth for intake answers as the user moves through the
// 7-question flow. No persistence yet: refreshing the page resets state.
// Add zustand/middleware/persist when we want survival across refresh.

import { create } from 'zustand';
import type {
  DrapingSkill,
  IntakeAnswers,
  JewelryLean,
  SkinDepth,
  TimeOfDay,
  UseCase,
} from '@/lib/copy/intake';

interface IntakeStore extends IntakeAnswers {
  setUseCase: (v: UseCase) => void;
  setLocation: (city: string, month: number) => void;
  setTimeOfDay: (v: TimeOfDay) => void;
  setSkinDepth: (v: SkinDepth) => void;
  setJewelryLean: (v: JewelryLean) => void;
  setDrapingSkill: (v: DrapingSkill) => void;
  setBudget: (inr: number) => void;
  reset: () => void;
}

const emptyAnswers: IntakeAnswers = {};

export const useIntake = create<IntakeStore>((set) => ({
  ...emptyAnswers,
  setUseCase: (useCase) => set({ useCase }),
  setLocation: (city, month) => set({ city, month }),
  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
  setSkinDepth: (skinDepth) => set({ skinDepth }),
  setJewelryLean: (jewelryLean) => set({ jewelryLean }),
  setDrapingSkill: (drapingSkill) => set({ drapingSkill }),
  setBudget: (budgetInr) => set({ budgetInr }),
  reset: () => set({ ...emptyAnswers }),
}));
