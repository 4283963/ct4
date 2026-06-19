import React, { useMemo } from 'react'
import { useWarehouseStore } from '../store/useWarehouseStore'

export function StatsPanel() {
  const racks = useWarehouseStore((s) => s.racks)
  const connected = useWarehouseStore((s) => s.connected)
  const lastUpdate = useWarehouseStore((s) => s.lastUpdate)

  const stats = useMemo(() => {
    let totalSlots = 0
    let occupied = 0
    let empty = 0
    let reserved = 0

    racks.forEach((rack) => {
      rack.slots?.forEach((slot) => {
        totalSlots++
        if (slot.status === 'occupied') occupied++
        else if (slot.status === 'empty') empty++
        else if (slot.status === 'reserved') reserved++
      })
    })

    const occupancyRate = totalSlots > 0 ? (occupied / totalSlots) * 100 : 0
    return { totalSlots, occupied, empty, reserved, occupancyRate, racks: racks.length }
  }, [racks])

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
      <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">仓库概览</h3>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className={`text-xs ${connected ? 'text-emerald-400' : 'text-red-400'}`}>
            {connected ? '已连接' : '已断开'}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/60 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">货架数量</div>
            <div className="text-2xl font-bold text-white">{stats.racks}</div>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">货位总数</div>
            <div className="text-2xl font-bold text-white">{stats.totalSlots}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              已占用
            </span>
            <span className="text-white font-medium">{stats.occupied}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              空货位
            </span>
            <span className="text-white font-medium">{stats.empty}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              已预留
            </span>
            <span className="text-white font-medium">{stats.reserved}</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400">仓库使用率</span>
            <span className="text-white font-medium">{stats.occupancyRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${stats.occupancyRate}%` }}
            />
          </div>
        </div>

        {lastUpdate && (
          <div className="pt-2 border-t border-slate-700/50">
            <div className="text-xs text-slate-500 text-center">
              最后更新: {new Date(lastUpdate / 1000000).toLocaleTimeString('zh-CN')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
