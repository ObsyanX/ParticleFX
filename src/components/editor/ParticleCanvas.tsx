import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Asset } from '@/hooks/useProjectAssets';

interface ParticleSystemProps {
  imageUrl: string | null;
  particleCount: number;
  particleSize: number;
  transitionProgress: number;
  isPlaying: boolean;
}

function ParticleSystem({ imageUrl, particleCount, particleSize, transitionProgress, isPlaying }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [targetImageData, setTargetImageData] = useState<ImageData | null>(null);
  const animationRef = useRef({ time: 0 });

  // Load image and extract pixel data
  useEffect(() => {
    if (!imageUrl) {
      setImageData(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Scale down for particle sampling
      const maxSize = 128;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = Math.floor(img.width * scale);
      canvas.height = Math.floor(img.height * scale);

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setImageData(data);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Generate particles from image data
  const { positions, colors, originalPositions } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);

    if (!imageData) {
      // Random sphere distribution when no image
      for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 2 + Math.random() * 0.5;

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        originalPositions[i * 3] = positions[i * 3];
        originalPositions[i * 3 + 1] = positions[i * 3 + 1];
        originalPositions[i * 3 + 2] = positions[i * 3 + 2];

        // Default cyan color
        colors[i * 3] = 0.2;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 0.9;
      }
    } else {
      const { width, height, data } = imageData;
      const aspectRatio = width / height;
      const scaleX = 4 * aspectRatio;
      const scaleY = 4;

      let particleIndex = 0;
      const samplingStep = Math.max(1, Math.floor((width * height) / particleCount));

      for (let i = 0; i < width * height && particleIndex < particleCount; i += samplingStep) {
        const x = i % width;
        const y = Math.floor(i / width);
        const pixelIndex = (y * width + x) * 4;

        const r = data[pixelIndex] / 255;
        const g = data[pixelIndex + 1] / 255;
        const b = data[pixelIndex + 2] / 255;
        const a = data[pixelIndex + 3] / 255;

        // Skip transparent pixels
        if (a < 0.1) continue;

        // Position in 3D space
        const px = (x / width - 0.5) * scaleX;
        const py = -(y / height - 0.5) * scaleY;
        const pz = (r + g + b) / 3 * 0.5 - 0.25; // Slight depth based on brightness

        positions[particleIndex * 3] = px;
        positions[particleIndex * 3 + 1] = py;
        positions[particleIndex * 3 + 2] = pz;

        originalPositions[particleIndex * 3] = px;
        originalPositions[particleIndex * 3 + 1] = py;
        originalPositions[particleIndex * 3 + 2] = pz;

        colors[particleIndex * 3] = r;
        colors[particleIndex * 3 + 1] = g;
        colors[particleIndex * 3 + 2] = b;

        particleIndex++;
      }

      // Fill remaining particles with random positions
      while (particleIndex < particleCount) {
        const px = (Math.random() - 0.5) * scaleX;
        const py = (Math.random() - 0.5) * scaleY;
        const pz = (Math.random() - 0.5) * 0.5;

        positions[particleIndex * 3] = px;
        positions[particleIndex * 3 + 1] = py;
        positions[particleIndex * 3 + 2] = pz;

        originalPositions[particleIndex * 3] = px;
        originalPositions[particleIndex * 3 + 1] = py;
        originalPositions[particleIndex * 3 + 2] = pz;

        colors[particleIndex * 3] = 0.2;
        colors[particleIndex * 3 + 1] = 0.8;
        colors[particleIndex * 3 + 2] = 0.9;

        particleIndex++;
      }
    }

    return { positions, colors, originalPositions };
  }, [imageData, particleCount]);

  // Animation loop
  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    if (isPlaying) {
      animationRef.current.time += delta;
      const time = animationRef.current.time;

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        const ox = originalPositions[idx];
        const oy = originalPositions[idx + 1];
        const oz = originalPositions[idx + 2];

        // Subtle floating animation
        const floatOffset = Math.sin(time * 0.5 + i * 0.01) * 0.02;
        const waveOffset = Math.sin(time * 0.3 + ox * 2) * 0.01;

        positions[idx] = ox + waveOffset;
        positions[idx + 1] = oy + floatOffset;
        positions[idx + 2] = oz + Math.sin(time * 0.4 + oy * 2) * 0.01;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={particleSize * 0.02}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function CameraController() {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 0, 5);
  }, [camera]);

  return (
    <OrbitControls
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={2}
      maxDistance={20}
      autoRotate={false}
      autoRotateSpeed={0.5}
    />
  );
}

interface ParticleCanvasProps {
  assets: Asset[];
  selectedAssetId: string | null;
  particleCount?: number;
  particleSize?: number;
  isPlaying?: boolean;
}

export function ParticleCanvas({
  assets,
  selectedAssetId,
  particleCount = 50000,
  particleSize = 1,
  isPlaying = true,
}: ParticleCanvasProps) {
  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  const imageUrl = selectedAsset?.file_url || null;

  return (
    <div className="w-full h-full bg-background rounded-lg overflow-hidden">
      <Canvas
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#0a0a0f']} />
        <fog attach="fog" args={['#0a0a0f', 5, 15]} />
        
        <PerspectiveCamera makeDefault fov={60} near={0.1} far={100} />
        <CameraController />

        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        <ParticleSystem
          imageUrl={imageUrl}
          particleCount={particleCount}
          particleSize={particleSize}
          transitionProgress={0}
          isPlaying={isPlaying}
        />
      </Canvas>
    </div>
  );
}
