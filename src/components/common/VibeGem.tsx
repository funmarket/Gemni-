import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshWobbleMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

const GemMesh = () => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.3;
      meshRef.current.rotation.z = time * 0.1;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} scale={1.15}>
      <MeshWobbleMaterial 
        color="#f97316" 
        factor={0.25} 
        speed={1.2} 
        metalness={0.15}
        roughness={0.4}
        emissive="#f59e0b"
        emissiveIntensity={0.65}
      />
    </Sphere>
  );
};

export const VibeGem = () => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1.2} />
        <pointLight position={[-10, -10, -10]} color="#f59e0b" intensity={1.5} />
        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1.5}>
            <GemMesh />
          </Float>
        </Suspense>
      </Canvas>
    </div>
  );
};
