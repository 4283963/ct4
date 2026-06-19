import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const STATUS_COLORS = {
  idle: '#64748b',
  moving: '#3b82f6',
  loading: '#f59e0b',
  unloading: '#a855f7',
  charging: '#10b981',
}

function BatteryIndicator({ battery }) {
  const color = battery > 50 ? '#10b981' : battery > 20 ? '#f59e0b' : '#ef4444'
  const width = (battery / 100) * 0.6
  return (
    <group position={[0, 0.5, 0.31]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.65, 0.1, 0.05]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[-0.325 + width / 2, 0, 0.03]}>
        <boxGeometry args={[width, 0.06, 0.04]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

export function AGV({ agv }) {
  const groupRef = useRef()
  const targetPos = useRef(new THREE.Vector3(agv.x, agv.y, agv.z))
  const currentPos = useRef(new THREE.Vector3(agv.x, agv.y, agv.z))
  const targetRot = useRef(0)
  const currentRot = useRef(0)
  const wheelRefs = useRef([])

  useEffect(() => {
    targetPos.current.set(agv.x, agv.y, agv.z)
  }, [agv.x, agv.y, agv.z])

  useEffect(() => {
    const dx = agv.targetX - agv.x
    const dz = agv.targetZ - agv.z
    if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
      targetRot.current = Math.atan2(dx, dz)
    }
  }, [agv.targetX, agv.targetZ, agv.x, agv.z])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    currentPos.current.lerp(targetPos.current, Math.min(delta * 8, 1))
    groupRef.current.position.copy(currentPos.current)

    let rotDiff = targetRot.current - currentRot.current
    while (rotDiff > Math.PI) rotDiff -= Math.PI * 2
    while (rotDiff < -Math.PI) rotDiff += Math.PI * 2
    currentRot.current += rotDiff * Math.min(delta * 6, 1)
    groupRef.current.rotation.y = currentRot.current

    if (agv.status === 'moving') {
      wheelRefs.current.forEach((wheel) => {
        if (wheel) wheel.rotation.x -= delta * 10
      })
    }
  })

  const bodyColor = STATUS_COLORS[agv.status] || STATUS_COLORS.idle
  const isCharging = agv.status === 'charging'

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.9, 0.2, 0.7]} />
        <meshStandardMaterial
          color={bodyColor}
          metalness={0.6}
          roughness={0.3}
          emissive={bodyColor}
          emissiveIntensity={isCharging ? 0.4 : 0.1}
        />
      </mesh>

      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.7, 0.2, 0.55]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.4} />
      </mesh>

      <BatteryIndicator battery={agv.battery} />

      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={bodyColor}
          emissiveIntensity={agv.status === 'moving' ? 0.8 : 0.3}
        />
      </mesh>

      {[
        [-0.35, 0, -0.25],
        [0.35, 0, -0.25],
        [-0.35, 0, 0.25],
        [0.35, 0, 0.25],
      ].map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => (wheelRefs.current[i] = el)}
          position={pos}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.1, 0.1, 0.12, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {agv.payload && (
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[0.5, 0.3, 0.4]} />
          <meshStandardMaterial color="#a855f7" metalness={0.3} roughness={0.6} />
        </mesh>
      )}
    </group>
  )
}
