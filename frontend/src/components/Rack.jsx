import React, { useMemo } from 'react'
import * as THREE from 'three'

const SLOT_COLORS = {
  empty: '#1e293b',
  occupied: '#10b981',
  reserved: '#f59e0b',
}

export function Slot({ slot }) {
  const color = SLOT_COLORS[slot.status] || SLOT_COLORS.empty
  const isOccupied = slot.status === 'occupied'

  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.0, 0.9, 0.5)), [])

  return (
    <group position={[slot.x, slot.y, slot.z]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.0, 0.9, 0.5]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={isOccupied ? 0.9 : 0.4}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      {isOccupied && (
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.8, 0.6, 0.4]} />
          <meshStandardMaterial
            color="#065f46"
            metalness={0.2}
            roughness={0.8}
          />
        </mesh>
      )}
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial color="#334155" transparent opacity={0.5} />
      </lineSegments>
    </group>
  )
}

export function Rack({ rack }) {
  return (
    <group position={[rack.x, rack.y, rack.z]}>
      <mesh position={[0, rack.height / 2, 0]}>
        <boxGeometry args={[rack.width + 0.2, rack.height + 0.2, rack.depth + 0.2]} />
        <meshStandardMaterial
          color="#374151"
          transparent
          opacity={0.15}
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[rack.width + 0.3, 0.1, rack.depth + 0.3]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, rack.height + 0.05, 0]}>
        <boxGeometry args={[rack.width + 0.3, 0.1, rack.depth + 0.3]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>
      {[-rack.width / 2, rack.width / 2].map((x, i) => (
        <mesh key={`pole-${i}`} position={[x, rack.height / 2, 0]}>
          <boxGeometry args={[0.12, rack.height, 0.12]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {rack.slots.map((slot) => {
        const localSlot = {
          ...slot,
          x: slot.x - rack.x,
          y: slot.y - rack.y,
          z: slot.z - rack.z,
        }
        return <Slot key={slot.id} slot={localSlot} />
      })}
    </group>
  )
}
