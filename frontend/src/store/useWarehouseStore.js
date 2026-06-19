import { create } from 'zustand'

export const useWarehouseStore = create((set) => ({
  agvs: [],
  racks: [],
  connected: false,
  lastUpdate: null,

  setSnapshot: (data) => set({
    agvs: data.agvs || [],
    racks: data.racks || [],
    lastUpdate: data.time || Date.now(),
  }),

  setConnected: (connected) => set({ connected }),
}))
