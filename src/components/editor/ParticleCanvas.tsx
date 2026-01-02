import { useRef, useMemo, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Asset } from '@/hooks/useProjectAssets';
import { TransitionStyle, BackgroundType } from './ParticleControls';

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
  colorContrast: number;
  colorSaturation: number;
  colorBrightness: number;
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
  colorContrast,
  colorSaturation,
  colorBrightness,
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
        case 'dissolve': {
          const dissolveProgress = easedProgress;
          const noise = Math.sin(i * 0.1 + time) * 0.5;
          const fade = dissolveProgress < 0.5 
            ? Math.sin(dissolveProgress * Math.PI) 
            : Math.sin((1 - dissolveProgress) * Math.PI);
          
          px = sx + (tx - sx) * dissolveProgress + noise * fade;
          py = sy + (ty - sy) * dissolveProgress + Math.cos(i * 0.1 + time) * 0.3 * fade;
          pz = sz + (tz - sz) * dissolveProgress + Math.sin(i * 0.05 + time * 2) * fade;
          break;
        }
        case 'spiral': {
          const spiralAngle = easedProgress * Math.PI * 6 + i * 0.001;
          const spiralRadius = Math.sin(easedProgress * Math.PI) * 2;
          const spiralHeight = easedProgress * 2 - 1;
          
          px = sx + (tx - sx) * easedProgress + Math.cos(spiralAngle) * spiralRadius * 0.3;
          py = sy + (ty - sy) * easedProgress + Math.sin(spiralAngle) * spiralRadius * 0.3;
          pz = sz + (tz - sz) * easedProgress + spiralHeight * 0.5;
          break;
        }
        case 'gravity': {
          const fallPhase = easedProgress < 0.5 ? easedProgress * 2 : (1 - easedProgress) * 2;
          const fallAmount = Math.pow(fallPhase, 2) * 3;
          const bounceOffset = Math.abs(Math.sin(fallPhase * Math.PI * 3)) * (1 - fallPhase) * 0.5;
          
          if (easedProgress < 0.5) {
            px = sx;
            py = sy - fallAmount + bounceOffset;
            pz = sz;
          } else {
            px = tx;
            py = ty - fallAmount * (1 - easedProgress) * 2 + bounceOffset;
            pz = tz;
          }
          break;
        }
        case 'vortex': {
          const vortexAngle = easedProgress * Math.PI * 8;
          const vortexRadius = (1 - easedProgress) * Math.sqrt(sx * sx + sy * sy) * 0.5;
          const vortexZ = easedProgress * 4 - 2;
          
          px = sx + (tx - sx) * easedProgress + Math.cos(vortexAngle + Math.atan2(sy, sx)) * vortexRadius;
          py = sy + (ty - sy) * easedProgress + Math.sin(vortexAngle + Math.atan2(sy, sx)) * vortexRadius;
          pz = sz + (tz - sz) * easedProgress + vortexZ * Math.sin(easedProgress * Math.PI);
          break;
        }
        case 'pixelate': {
          const gridSize = 0.2;
          const snapPhase = Math.sin(easedProgress * Math.PI);
          const snappedSx = Math.round(sx / gridSize) * gridSize;
          const snappedSy = Math.round(sy / gridSize) * gridSize;
          const snappedTx = Math.round(tx / gridSize) * gridSize;
          const snappedTy = Math.round(ty / gridSize) * gridSize;
          
          px = sx + (snappedSx - sx) * snapPhase + (tx - sx) * easedProgress + (snappedTx - tx) * (1 - snapPhase) * easedProgress;
          py = sy + (snappedSy - sy) * snapPhase + (ty - sy) * easedProgress + (snappedTy - ty) * (1 - snapPhase) * easedProgress;
          pz = sz + (tz - sz) * easedProgress;
          break;
        }
        case 'shatter': {
          const shatterPhase = easedProgress < 0.5 ? easedProgress * 2 : (1 - easedProgress) * 2;
          const shatterOffset = Math.sin(shatterPhase * Math.PI) * 2;
          const angle = Math.atan2(sy, sx) + i * 0.001;
          const randomDir = Math.sin(i * 12.9898) * 43758.5453 % 1;
          
          if (easedProgress < 0.5) {
            px = sx + Math.cos(angle) * shatterOffset * randomDir;
            py = sy + Math.sin(angle) * shatterOffset * randomDir - shatterPhase * 2;
            pz = sz + (randomDir - 0.5) * shatterOffset;
          } else {
            px = tx + Math.cos(angle) * shatterOffset * randomDir * (1 - easedProgress);
            py = ty + Math.sin(angle) * shatterOffset * randomDir * (1 - easedProgress);
            pz = tz;
          }
          break;
        }
        case 'magnetic': {
          const magnetPhase = Math.sin(easedProgress * Math.PI);
          const centerDist = Math.sqrt(sx * sx + sy * sy);
          const attractForce = magnetPhase * (centerDist > 1 ? -0.5 : 1.5);
          
          px = sx + (tx - sx) * easedProgress + (sx * attractForce * 0.3);
          py = sy + (ty - sy) * easedProgress + (sy * attractForce * 0.3);
          pz = sz + (tz - sz) * easedProgress + magnetPhase * 0.5;
          break;
        }
        case 'ripple': {
          const dist = Math.sqrt(sx * sx + sy * sy);
          const rippleWave = Math.sin(dist * 5 - easedProgress * Math.PI * 4) * (1 - easedProgress);
          
          px = sx + (tx - sx) * easedProgress;
          py = sy + (ty - sy) * easedProgress;
          pz = sz + (tz - sz) * easedProgress + rippleWave * 0.5;
          break;
        }
        case 'scatter': {
          const scatterPhase = easedProgress < 0.3 ? easedProgress / 0.3 : easedProgress > 0.7 ? (1 - easedProgress) / 0.3 : 1;
          const randomX = (Math.sin(i * 12.9898) * 43758.5453 % 1 - 0.5) * 4;
          const randomY = (Math.cos(i * 78.233) * 43758.5453 % 1 - 0.5) * 4;
          const randomZ = (Math.sin(i * 43.2323) * 43758.5453 % 1 - 0.5) * 2;
          
          px = sx + (tx - sx) * easedProgress + randomX * scatterPhase;
          py = sy + (ty - sy) * easedProgress + randomY * scatterPhase;
          pz = sz + (tz - sz) * easedProgress + randomZ * scatterPhase;
          break;
        }
        case 'tornado': {
          const tornadoAngle = easedProgress * Math.PI * 8 + i * 0.001;
          const heightFactor = (i % 100) / 100;
          const tornadoRadius = (1 - heightFactor) * 0.5 + Math.sin(easedProgress * Math.PI) * 0.5;
          
          px = sx + (tx - sx) * easedProgress + Math.cos(tornadoAngle) * tornadoRadius;
          py = sy + (ty - sy) * easedProgress + (heightFactor - 0.5) * 2 * Math.sin(easedProgress * Math.PI);
          pz = sz + (tz - sz) * easedProgress + Math.sin(tornadoAngle) * tornadoRadius;
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
      // Apply color enhancement (contrast, saturation, brightness)
      let r: number, g: number, b: number;
      
      if (transitionProgress === 0 || images.length <= 1) {
        r = sourceColors[idx] || 0.5;
        g = sourceColors[idx + 1] || 0.5;
        b = sourceColors[idx + 2] || 0.5;
      } else {
        r = sourceColors[idx] + ((targetColors[idx] || sourceColors[idx]) - sourceColors[idx]) * easedProgress;
        g = sourceColors[idx + 1] + ((targetColors[idx + 1] || sourceColors[idx + 1]) - sourceColors[idx + 1]) * easedProgress;
        b = sourceColors[idx + 2] + ((targetColors[idx + 2] || sourceColors[idx + 2]) - sourceColors[idx + 2]) * easedProgress;
      }
      
      // Apply brightness
      r *= colorBrightness;
      g *= colorBrightness;
      b *= colorBrightness;
      
      // Apply contrast (centered around 0.5)
      r = (r - 0.5) * colorContrast + 0.5;
      g = (g - 0.5) * colorContrast + 0.5;
      b = (b - 0.5) * colorContrast + 0.5;
      
      // Apply saturation
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      r = gray + (r - gray) * colorSaturation;
      g = gray + (g - gray) * colorSaturation;
      b = gray + (b - gray) * colorSaturation;
      
      // Clamp values
      colors[idx] = Math.max(0, Math.min(1, r));
      colors[idx + 1] = Math.max(0, Math.min(1, g));
      colors[idx + 2] = Math.max(0, Math.min(1, b));
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
  captureSnapshot: () => Promise<Blob | null>;
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
  backgroundType?: BackgroundType;
  backgroundGradient?: string;
  backgroundImage?: string;
  backgroundOpacity?: number;
  backgroundBlur?: number;
  autoRotate?: boolean;
  depthEnabled?: boolean;
  colorContrast?: number;
  colorSaturation?: number;
  colorBrightness?: number;
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
  backgroundType = 'color',
  backgroundGradient = '',
  backgroundImage = '',
  backgroundOpacity = 1.0,
  backgroundBlur = 0,
  autoRotate = false,
  depthEnabled = false,
  colorContrast = 1.0,
  colorSaturation = 1.0,
  colorBrightness = 1.0,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageDataStates, setImageDataStates] = useState<ImageDataState[]>([]);

  useImperativeHandle(ref, () => ({
    getCanvas: () => containerRef.current?.querySelector('canvas') || null,
    captureSnapshot: async (): Promise<Blob | null> => {
      const canvas = containerRef.current?.querySelector('canvas');
      if (!canvas) return null;
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 0.9);
      });
    },
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

  // Compute background style
  const bgStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      opacity: backgroundOpacity,
      filter: backgroundBlur > 0 ? `blur(${backgroundBlur}px)` : undefined,
    };

    if (backgroundType === 'image' && backgroundImage) {
      return {
        ...baseStyle,
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    if (backgroundType === 'gradient' && backgroundGradient) {
      return { ...baseStyle, background: backgroundGradient };
    }
    return { ...baseStyle, backgroundColor };
  }, [backgroundType, backgroundColor, backgroundGradient, backgroundImage, backgroundOpacity, backgroundBlur]);

  // Use transparent canvas when we have gradient or image background
  const useTransparentCanvas = backgroundType !== 'color';

  return (
    <div ref={containerRef} className="w-full h-full rounded-lg overflow-hidden relative">
      {/* Background layer */}
      <div 
        className="absolute inset-0 z-0" 
        style={bgStyle}
      />
      
      {/* Overlay for better particle visibility when using image */}
      {backgroundType === 'image' && backgroundImage && (
        <div 
          className="absolute inset-0 z-[1] bg-black/30"
          style={{ opacity: 1 - backgroundOpacity }}
        />
      )}
      
      {/* Canvas layer */}
      <div className="absolute inset-0 z-10">
        <Canvas
          key={`canvas-${particleCount}`}
          gl={{ 
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true,
          }}
          dpr={[1, 2]}
          style={{ background: useTransparentCanvas ? 'transparent' : undefined }}
        >
          {!useTransparentCanvas && (
            <>
              <color attach="background" args={[backgroundColor]} />
              <fog attach="fog" args={[backgroundColor, 8, 20]} />
            </>
          )}
          
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
            colorContrast={colorContrast}
            colorSaturation={colorSaturation}
            colorBrightness={colorBrightness}
          />
        </Canvas>
      </div>
    </div>
  );
});

ParticleCanvas.displayName = 'ParticleCanvas';
