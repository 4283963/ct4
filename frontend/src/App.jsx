import React from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import { WarehouseScene } from './components/WarehouseScene'
import { AGVPanel } from './components/AGVPanel'
import { StatsPanel } from './components/StatsPanel'

function App() {
  useWebSocket()

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
      <header className="flex-shrink-0 px-6 py-3 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">智能立体仓库数字孪生系统</h1>
            <p className="text-xs text-slate-400">Intelligent Warehouse Digital Twin Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              移动中
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              充电中
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              空闲
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="flex-shrink-0 w-72 p-3 space-y-3 overflow-y-auto scrollbar-thin border-r border-slate-700/50">
          <StatsPanel />
          <AGVPanel />
        </aside>

        <section className="flex-1 relative">
          <WarehouseScene />
          <div className="absolute bottom-4 left-4 bg-slate-900/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700/50">
            <p className="text-xs text-slate-400">
              <span className="text-white font-medium">操作提示：</span>
              鼠标左键拖动旋转视角，右键平移，滚轮缩放
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
