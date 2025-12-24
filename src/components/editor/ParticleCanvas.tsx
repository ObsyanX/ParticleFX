import { useRef, useMemo, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Asset } from '@/hooks/useProjectAssets';

type TransitionStyle = 'morph' | 'explode' | 'swirl' | 'wave' | 'depth';

interface ImageDataState {
  data: ImageData;
  positions: Float32Array;
  colors: Float32Array;
}

interface ParticleSystemProps {
  images: ImageDataState[];
  currentImageIndex: number;
  transitionProgress: number;
  transitionStyle: TransitionStyle;
  particleCount: number;
  particleSize: number;
  isPlaying: boolean;
  depthEnabled: boolean;
}

function loadImageData(url: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Use larger size for better color sampling
      const maxSize = 256;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = Math.floor(img.width * scale);
      canvas.height = Math.floor(img.height * scale);

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
    };
    img.onerror = reject;
    img.src = url;
  });
}

function generateParticlesFromImage(imageData: ImageData, particleCount: number): { positions: Float32Array; colors: Float32Array } {
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const { width, height, data } = imageData;
  const aspectRatio = width / height;
  const scaleX = 4 * aspectRatio;
  const scaleY = 4;

  // Collect all valid pixels with their colors
  const validPixels: { x: number; y: number; r: number; g: number; b: number }[] = [];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIndex = (y * width + x) * 4;
      const a = data[pixelIndex + 3] / 255;
      
      if (a > 0.1) {
        validPixels.push({
          x,
          y,
          r: data[pixelIndex] / 255,
          g: data[pixelIndex + 1] / 255,
          b: data[pixelIndex + 2] / 255,
        });
      }
    }
  }

  // Distribute particles across valid pixels
  for (let i = 0; i < particleCount; i++) {
    if (validPixels.length > 0) {
      // Sample from valid pixels with some randomization for density
      const pixelIdx = Math.floor((i / particleCount) * validPixels.length);
      const pixel = validPixels[Math.min(pixelIdx, validPixels.length - 1)];
      
      // Add small random offset for natural look
      const jitterX = (Math.random() - 0.5) * 0.05;
      const jitterY = (Math.random() - 0.5) * 0.05;
      
      const px = (pixel.x / width - 0.5) * scaleX + jitterX;
      const py = -(pixel.y / height - 0.5) * scaleY + jitterY;
      const pz = (Math.random() - 0.5) * 0.1;

      positions[i * 3] = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;

      // Use actual pixel colors
      colors[i * 3] = pixel.r;
      colors[i * 3 + 1] = pixel.g;
      colors[i * 3 + 2] = pixel.b;
    } else {
      // Fallback for images with no valid pixels
      positions[i * 3] = (Math.random() - 0.5) * scaleX;
      positions[i * 3 + 1] = (Math.random() - 0.5) * scaleY;
      positions[i * 3 + 2] = 0;

      colors[i * 3] = 0.5;
      colors[i * 3 + 1] = 0.5;
      colors[i * 3 + 2] = 0.5;
    }
  }

  return { positions, colors };
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function ParticleSystem({
  images,
  currentImageIndex,
  transitionProgress,
  transitionStyle,
  particleCount,
  particleSize,
  isPlaying,
  depthEnabled,
}: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const animationRef = useRef({ time: 0 });

  // Default particles when no images
  const defaultParticles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 2 + Math.random() * 0.5;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Use a nice gradient color
      const hue = (i / particleCount) * 0.3 + 0.5;
      colors[i * 3] = hue * 0.3;
      colors[i * 3 + 1] = hue * 0.7;
      colors[i * 3 + 2] = hue;
    }

    return { positions, colors };
  }, [particleCount]);

  // Current and next image data
  const currentImage = images[currentImageIndex];
  const nextImageIndex = (currentImageIndex + 1) % Math.max(1, images.length);
  const nextImage = images[nextImageIndex];

  const sourcePositions = currentImage?.positions || defaultParticles.positions;
  const sourceColors = currentImage?.colors || defaultParticles.colors;
  const targetPositions = nextImage?.positions || sourcePositions;
  const targetColors = nextImage?.colors || sourceColors;

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const positionAttr = pointsRef.current.geometry.attributes.position;
    const colorAttr = pointsRef.current.geometry.attributes.color;
    const positions = positionAttr.array as Float32Array;
    const colors = colorAttr.array as Float32Array;

    if (isPlaying) {
      animationRef.current.time += delta;
    }
    const time = animationRef.current.time;
    const easedProgress = easeInOutCubic(transitionProgress);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      
      const sx = sourcePositions[idx] || 0;
      const sy = sourcePositions[idx + 1] || 0;
      const sz = sourcePositions[idx + 2] || 0;
      
      const tx = targetPositions[idx] || sx;
      const ty = targetPositions[idx + 1] || sy;
      const tz = targetPositions[idx + 2] || sz;

      let px = sx, py = sy, pz = sz;

      // Apply transition effect
      switch (transitionStyle) {
        case 'morph': {
          px = sx + (tx - sx) * easedProgress;
          py = sy + (ty - sy) * easedProgress;
          pz = sz + (tz - sz) * easedProgress;
          break;
        }
        case 'explode': {
          const explodePhase = easedProgress < 0.5 ? easedProgress * 2 : (1 - easedProgress) * 2;
          const explodeForce = Math.sin(explodePhase * Math.PI) * 3;
          const angle = Math.atan2(sy, sx);
          
          if (easedProgress < 0.5) {
            px = sx + Math.cos(angle + i * 0.01) * explodeForce;
            py = sy + Math.sin(angle + i * 0.01) * explodeForce;
            pz = sz + (Math.random() - 0.5) * explodeForce;
          } else {
            px = tx + Math.cos(angle + i * 0.01) * explodeForce * (1 - easedProgress) * 2;
            py = ty + Math.sin(angle + i * 0.01) * explodeForce * (1 - easedProgress) * 2;
            pz = tz;
          }
          break;
        }
        case 'swirl': {
          const swirlAngle = easedProgress * Math.PI * 4;
          const swirlRadius = Math.sin(easedProgress * Math.PI) * 0.5;
          const midX = sx + (tx - sx) * easedProgress;
          const midY = sy + (ty - sy) * easedProgress;
          const midZ = sz + (tz - sz) * easedProgress;
          
          px = midX + Math.cos(swirlAngle + i * 0.02) * swirlRadius;
          py = midY + Math.sin(swirlAngle + i * 0.02) * swirlRadius;
          pz = midZ + Math.sin(swirlAngle * 0.5 + i * 0.01) * swirlRadius * 0.5;
          break;
        }
        case 'wave': {
          const waveOffset = Math.sin(easedProgress * Math.PI * 2 + sx * 2) * (1 - Math.abs(easedProgress - 0.5) * 2);
          px = sx + (tx - sx) * easedProgress;
          py = sy + (ty - sy) * easedProgress + waveOffset * 0.5;
          pz = sz + (tz - sz) * easedProgress + Math.cos(easedProgress * Math.PI * 2 + sy * 2) * waveOffset * 0.3;
          break;
        }
        case 'depth': {
          const depthPhase = easedProgress < 0.5 ? easedProgress * 2 : (1 - easedProgress) * 2;
          const depthOffset = Math.sin(depthPhase * Math.PI) * 5;
          
          if (easedProgress < 0.5) {
            px = sx;
            py = sy;
            pz = sz - depthOffset;
          } else {
            px = tx;
            py = ty;
            pz = tz - depthOffset * (1 - easedProgress) * 2;
          }
          break;
        }
      }

      // Add subtle floating animation when playing
      if (isPlaying && transitionProgress === 0) {
        const floatOffset = Math.sin(time * 0.5 + i * 0.01) * 0.02;
        const waveOffset = Math.sin(time * 0.3 + px * 2) * 0.01;
        px += waveOffset;
        py += floatOffset;
        pz += Math.sin(time * 0.4 + py * 2) * 0.01;
      }

      // Apply depth effect if enabled
      if (depthEnabled) {
        const brightness = (sourceColors[idx] + sourceColors[idx + 1] + sourceColors[idx + 2]) / 3;
        pz += brightness * 0.5 - 0.25;
      }

      positions[idx] = px;
      positions[idx + 1] = py;
      positions[idx + 2] = pz;

      // Interpolate colors - use exact source colors when no transition
      if (transitionProgress === 0 || images.length <= 1) {
        colors[idx] = sourceColors[idx] || 0.5;
        colors[idx + 1] = sourceColors[idx + 1] || 0.5;
        colors[idx + 2] = sourceColors[idx + 2] || 0.5;
      } else {
        colors[idx] = sourceColors[idx] + ((targetColors[idx] || sourceColors[idx]) - sourceColors[idx]) * easedProgress;
        colors[idx + 1] = sourceColors[idx + 1] + ((targetColors[idx + 1] || sourceColors[idx + 1]) - sourceColors[idx + 1]) * easedProgress;
        colors[idx + 2] = sourceColors[idx + 2] + ((targetColors[idx + 2] || sourceColors[idx + 2]) - sourceColors[idx + 2]) * easedProgress;
      }
    }

    positionAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
  });

  // Initial geometry - create once with fixed size
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    // Initialize with default values
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      colors[i * 3] = 0.5;
      colors[i * 3 + 1] = 0.5;
      colors[i * 3 + 2] = 0.5;
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    return geo;
  }, [particleCount]);

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={particleSize * 0.015}
        vertexColors
        transparent
        opacity={0.95}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function CameraController({ autoRotate }: { autoRotate: boolean }) {
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
      autoRotate={autoRotate}
      autoRotateSpeed={0.5}
    />
  );
}

export interface ParticleCanvasHandle {
  getCanvas: () => HTMLCanvasElement | null;
}

interface ParticleCanvasProps {
  assets: Asset[];
  currentTime: number;
  duration: number;
  particleCount?: number;
  particleSize?: number;
  transitionStyle?: TransitionStyle;
  isPlaying?: boolean;
  backgroundColor?: string;
  autoRotate?: boolean;
  depthEnabled?: boolean;
}

export const ParticleCanvas = forwardRef<ParticleCanvasHandle, ParticleCanvasProps>(({
  assets,
  currentTime,
  duration,
  particleCount = 50000,
  particleSize = 2,
  transitionStyle = 'morph',
  isPlaying = true,
  backgroundColor = '#0a0a0f',
  autoRotate = false,
  depthEnabled = false,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageDataStates, setImageDataStates] = useState<ImageDataState[]>([]);

  useImperativeHandle(ref, () => ({
    getCanvas: () => containerRef.current?.querySelector('canvas') || null,
  }));

  // Load all images
  useEffect(() => {
    const loadImages = async () => {
      const states: ImageDataState[] = [];
      
      for (const asset of assets) {
        try {
          const data = await loadImageData(asset.file_url);
          const { positions, colors } = generateParticlesFromImage(data, particleCount);
          states.push({ data, positions, colors });
        } catch (error) {
          console.error('Failed to load image:', asset.file_url, error);
        }
      }
      
      setImageDataStates(states);
    };

    if (assets.length > 0) {
      loadImages();
    } else {
      setImageDataStates([]);
    }
  }, [assets, particleCount]);

  // Calculate current image index and transition progress based on timeline
  const { currentImageIndex, transitionProgress } = useMemo(() => {
    if (assets.length === 0) {
      return { currentImageIndex: 0, transitionProgress: 0 };
    }
    
    if (assets.length === 1) {
      return { currentImageIndex: 0, transitionProgress: 0 };
    }

    const transitionCount = assets.length - 1;
    const transitionDuration = duration / transitionCount;
    const currentIndex = Math.min(
      Math.floor(currentTime / transitionDuration),
      transitionCount - 1
    );
    const transitionStart = currentIndex * transitionDuration;
    const progress = Math.min(1, (currentTime - transitionStart) / transitionDuration);

    return { currentImageIndex: currentIndex, transitionProgress: progress };
  }, [assets.length, currentTime, duration]);

  return (
    <div ref={containerRef} className="w-full h-full rounded-lg overflow-hidden">
      <Canvas
        key={`canvas-${particleCount}`}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={[backgroundColor]} />
        <fog attach="fog" args={[backgroundColor, 8, 20]} />
        
        <PerspectiveCamera makeDefault fov={60} near={0.1} far={100} />
        <CameraController autoRotate={autoRotate} />

        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />

        <ParticleSystem
          key={`particles-${particleCount}`}
          images={imageDataStates}
          currentImageIndex={currentImageIndex}
          transitionProgress={transitionProgress}
          transitionStyle={transitionStyle}
          particleCount={particleCount}
          particleSize={particleSize}
          isPlaying={isPlaying}
          depthEnabled={depthEnabled}
        />
      </Canvas>
    </div>
  );
});

ParticleCanvas.displayName = 'ParticleCanvas';
