import { useEffect, useRef } from 'react'
import { useWarehouseStore } from '../store/useWarehouseStore'

export function useWebSocket() {
  const wsRef = useRef(null)
  const setSnapshot = useWarehouseStore((s) => s.setSnapshot)
  const setConnected = useWarehouseStore((s) => s.setConnected)

  useEffect(() => {
    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = window.location.hostname
      const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80')
      const wsUrl = `${protocol}//${host}:${port}/ws`

      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setSnapshot(data)
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      ws.onclose = () => {
        setConnected(false)
        setTimeout(connect, 2000)
      }
    }

    connect()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [setSnapshot, setConnected])
}
