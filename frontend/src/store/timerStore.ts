import { create } from 'zustand'

interface TimerStore {
  isRunning: boolean
  startTime: Date | null
  elapsed: number // seconds
  start: () => void
  stop: () => void
  reset: () => void
  tick: () => void
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  isRunning: false,
  startTime: null,
  elapsed: 0,
  start: () => set({ isRunning: true, startTime: new Date(), elapsed: 0 }),
  stop: () => set({ isRunning: false }),
  reset: () => set({ isRunning: false, startTime: null, elapsed: 0 }),
  tick: () => {
    const { isRunning, startTime } = get()
    if (isRunning && startTime) {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000)
      set({ elapsed })
    }
  },
}))
