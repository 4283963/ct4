import React, { useMemo } from 'react'
import { useWarehouseStore } from '../store/useWarehouseStore'

const STATUS_LABELS = {
  idle: '空闲',
  moving: '移动中',
  loading: '装货',
  unloading: '卸货',
  charging: '充电中',
}

const STATUS_COLORS = {
  idle: 'bg-slate-500',
  moving: 'bg-blue-500',
  loading: 'bg-amber-500',
  unloading: 'bg-purple-500',
  charging: 'bg-emerald-500',
}

function BatteryBar({ battery }) {
  const color = battery > 50 ? 'bg-emerald-500' : battery > 20 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="w-full bg-slate-700 rounded-full h-1.5">
      <div
        className={`${color} h-1.5 rounded-full transition-all duration-300`}
        style={{ width: `${battery}%` }}
      />
    </div>
  )
}

function AGVCard({ agv }) {
  return (
    <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50 hover:border-slate-600 transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-white">{agv.id.toUpperCase()}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full text-white ${STATUS_COLORS[agv.status] || 'bg-slate-500'}`}>
          {STATUS_LABELS[agv.status] || agv.status}
        </span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">电量</span>
          <span className="text-white font-mono">{agv.battery.toFixed(1)}%</span>
        </div>
        <BatteryBar battery={agv.battery} />
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-slate-400">位置</span>
          <span className="text-slate-300 font-mono">
            ({agv.x.toFixed(2)}, {agv.z.toFixed(2)})
          </span>
        </div>
      </div>
    </div>
  )
}

export function AGVPanel() {
  const agvs = useWarehouseStore((s) => s.agvs)

  const stats = useMemo(() => {
    const total = agvs.length
    const moving = agvs.filter((a) => a.status === 'moving').length
    const charging = agvs.filter((a) => a.status === 'charging').length
    const idle = agvs.filter((a) => a.status === 'idle').length
    const avgBattery = total > 0 ? agvs.reduce((sum, a) => sum + a.battery, 0) / total : 0
    return { total, moving, charging, idle, avgBattery }
  }, [agvs])

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
      <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
        <h3 className="text-sm font-semibold text-white">AGV 车队状态</h3>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="bg-slate-800/60 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-white">{stats.total}</div>
            <div className="text-xs text-slate-400">总数</div>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-blue-400">{stats.moving}</div>
            <div className="text-xs text-slate-400">运行中</div>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-emerald-400">{stats.charging}</div>
            <div className="text-xs text-slate-400">充电</div>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-slate-300">{stats.idle}</div>
            <div className="text-xs text-slate-400">空闲</div>
          </div>
        </div>
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">平均电量</span>
            <span className="text-white">{stats.avgBattery.toFixed(1)}%</span>
          </div>
          <BatteryBar battery={stats.avgBattery} />
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin pr-1">
          {agvs.map((agv) => (
            <AGVCard key={agv.id} agv={agv} />
          ))}
        </div>
      </div>
    </div>
  )
}
