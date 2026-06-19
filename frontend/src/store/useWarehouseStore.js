import { create } from 'zustand'

export const useWarehouseStore = create((set) => ({
  agvs: [],
  racks: [],
  connected: false,
  lastUpdate: null,
  showHeatmap: false,
  maxVisitCount: 100,

  setSnapshot: (data) => set((state) => {
    let maxCount = state.maxVisitCount
    if (data.racks) {
      for (const rack of data.racks) {
        if (rack.slots) {
          for (const slot of rack.slots) {
            if (slot.visitCount > maxCount) {
              maxCount = slot.visitCount
            }
          }
        }
      }
    }
    return {
      agvs: data.agvs || [],
      racks: data.racks || [],
      lastUpdate: data.time || Date.now(),
      maxVisitCount: Math.max(1, maxCount),
    }
  }),

  setConnected: (connected) => set({ connected }),
  toggleHeatmap: () => set((state) => ({ showHeatmap: !state.showHeatmap })),
}))
