import React, { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Environment } from '@react-three/drei'
import { useWarehouseStore } from '../store/useWarehouseStore'
import { Rack } from './Rack'
import { AGV } from './AGV'

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[60, 40]} />
      <meshStandardMaterial color="#0f172a" metalness={0.1} roughness={0.9} />
    </mesh>
  )
}

function Walls() {
  return (
    <group>
      <mesh position={[0, 3, -20]}>
        <boxGeometry args={[60, 6, 0.2]} />
        <meshStandardMaterial color="#1e293b" transparent opacity={0.3} side={2} />
      </mesh>
      <mesh position={[0, 3, 20]}>
        <boxGeometry args={[60, 6, 0.2]} />
        <meshStandardMaterial color="#1e293b" transparent opacity={0.3} side={2} />
      </mesh>
      <mesh position={[-30, 3, 0]}>
        <boxGeometry args={[0.2, 6, 40]} />
        <meshStandardMaterial color="#1e293b" transparent opacity={0.3} side={2} />
      </mesh>
      <mesh position={[30, 3, 0]}>
        <boxGeometry args={[0.2, 6, 40]} />
        <meshStandardMaterial color="#1e293b" transparent opacity={0.3} side={2} />
      </mesh>
    </group>
  )
}

function ChargingStation() {
  return (
    <group position={[-10, 0, 0]}>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[2, 0.1, 2]} />
        <meshStandardMaterial color="#065f46" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[-0.8, 0.6, -0.8]}>
        <cylinderGeometry args={[0.08, 0.08, 1.2, 8]} />
        <meshStandardMaterial color="#10b981" metalness={0.7} roughness={0.3} emissive="#10b981" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0.8, 0.6, -0.8]}>
        <cylinderGeometry args={[0.08, 0.08, 1.2, 8]} />
        <meshStandardMaterial color="#10b981" metalness={0.7} roughness={0.3} emissive="#10b981" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, 1.2, -0.8]}>
        <boxGeometry args={[2, 0.1, 0.3]} />
        <meshStandardMaterial color="#10b981" metalness={0.7} roughness={0.3} emissive="#10b981" emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[15, 25, 15]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 8, 0]} intensity={0.6} color="#7dd3fc" />
      <pointLight position={[-12, 5, -6]} intensity={0.4} color="#93c5fd" />
      <pointLight position={[12, 5, 6]} intensity={0.4} color="#93c5fd" />
    </>
  )
}

function SceneContent() {
  const racks = useWarehouseStore((s) => s.racks)
  const agvs = useWarehouseStore((s) => s.agvs)

  const racksMemo = useMemo(() => racks, [racks])
  const agvsMemo = useMemo(() => agvs, [agvs])

  return (
    <>
      <Lights />
      <Floor />
      <Walls />
      <ChargingStation />
      <Grid
        position={[0, 0, 0]}
        args={[60, 40]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1e293b"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#334155"
        fadeDistance={50}
        fadeStrength={1}
        infiniteGrid={false}
      />
      {racksMemo.map((rack) => (
        <Rack key={rack.id} rack={rack} />
      ))}
      {agvsMemo.map((agv) => (
        <AGV key={agv.id} agv={agv} />
      ))}
    </>
  )
}

export function WarehouseScene() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [20, 18, 20], fov: 50 }}
        shadows
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#0a0e17']} />
        <fog attach="fog" args={['#0a0e17', 30, 80]} />
        <SceneContent />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={60}
          maxPolarAngle={Math.PI / 2 - 0.05}
          target={[0, 2, 0]}
        />
      </Canvas>
    </div>
  )
}
