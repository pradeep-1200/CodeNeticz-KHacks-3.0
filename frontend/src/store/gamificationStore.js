import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useGamificationStore = create(
  persist(
    (set, get) => ({
      xp:             0,
      level:          1,
      world:          1,
      streak:         0,
      gems:           0,
      completedLevels: [],
      lastActiveDate: null,

      syncFromServer: (data) => set({
        xp:    data.xp    ?? get().xp,
        level: data.level ?? get().level,
        world: data.world ?? get().world,
        streak: data.streak ?? get().streak,
        gems:   data.gems ?? get().gems
      }),

      addXP: (amount) => set(s => {
        const newXP    = s.xp + amount;
        const newLevel = Math.floor(newXP / 1000) + 1;
        const newWorld = Math.min(10, Math.floor((newLevel - 1) / 10) + 1);
        return { xp: newXP, level: newLevel, world: newWorld };
      }),

      completeLevel: (levelId) => set(s => ({
        completedLevels: s.completedLevels.includes(levelId)
          ? s.completedLevels
          : [...s.completedLevels, levelId]
      })),

      xpToNextLevel: () => 1000 - (get().xp % 1000),
      levelProgress:  () => (get().xp % 1000) / 10  // 0-100 percentage
    }),
    { name: 'aclc_gamification' }
  )
);
