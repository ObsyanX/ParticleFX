import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Code2, Download, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ParticleSettings } from './ParticleControls';
import { Asset } from '@/hooks/useProjectAssets';

interface CodeExportProps {
  settings: ParticleSettings;
  assets: Asset[];
  projectName: string;
}

type ExportFormat = 'react' | 'vanilla' | 'html';

export function CodeExport({ settings, assets, projectName }: CodeExportProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('react');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateReactCode = () => {
    const imageUrls = assets.map(a => `'${a.file_url}'`).join(',\n      ');
    
    return `// ${projectName} - Particle Animation
// Generated with Particle Studio
// Dependencies: npm install three @react-three/fiber @react-three/drei

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Configuration
const CONFIG = {
  particleCount: ${settings.particleCount},
  particleSize: ${settings.particleSize},
  transitionStyle: '${settings.transitionStyle}',
  transitionDuration: ${settings.transitionDuration},
  duration: ${settings.duration},
  fps: ${settings.fps},
  backgroundColor: '${settings.backgroundColor}',
  autoRotate: ${settings.autoRotate},
  depthEnabled: ${settings.depthEnabled},
  images: [
    ${imageUrls || '// Add your image URLs here'}
  ]
};

function loadImageData(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
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

function generateParticlesFromImage(imageData, particleCount) {
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const { width, height, data } = imageData;
  const aspectRatio = width / height;
  const scaleX = 4 * aspectRatio;
  const scaleY = 4;

  const validPixels = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIndex = (y * width + x) * 4;
      const a = data[pixelIndex + 3] / 255;
      if (a > 0.1) {
        validPixels.push({
          x, y,
          r: data[pixelIndex] / 255,
          g: data[pixelIndex + 1] / 255,
          b: data[pixelIndex + 2] / 255,
        });
      }
    }
  }

  for (let i = 0; i < particleCount; i++) {
    if (validPixels.length > 0) {
      const pixelIdx = Math.floor((i / particleCount) * validPixels.length);
      const pixel = validPixels[Math.min(pixelIdx, validPixels.length - 1)];
      const jitterX = (Math.random() - 0.5) * 0.05;
      const jitterY = (Math.random() - 0.5) * 0.05;
      
      positions[i * 3] = (pixel.x / width - 0.5) * scaleX + jitterX;
      positions[i * 3 + 1] = -(pixel.y / height - 0.5) * scaleY + jitterY;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
      colors[i * 3] = pixel.r;
      colors[i * 3 + 1] = pixel.g;
      colors[i * 3 + 2] = pixel.b;
    }
  }

  return { positions, colors };
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function ParticleSystem({ images, currentTime }) {
  const pointsRef = useRef();
  const animationRef = useRef({ time: 0 });

  const { currentImageIndex, transitionProgress } = useMemo(() => {
    if (images.length <= 1) return { currentImageIndex: 0, transitionProgress: 0 };
    const transitionCount = images.length - 1;
    const transitionDuration = CONFIG.duration / transitionCount;
    const currentIndex = Math.min(Math.floor(currentTime / transitionDuration), transitionCount - 1);
    const transitionStart = currentIndex * transitionDuration;
    const progress = Math.min(1, (currentTime - transitionStart) / transitionDuration);
    return { currentImageIndex: currentIndex, transitionProgress: progress };
  }, [images.length, currentTime]);

  const currentImage = images[currentImageIndex];
  const nextImage = images[(currentImageIndex + 1) % Math.max(1, images.length)];

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const positionAttr = pointsRef.current.geometry.attributes.position;
    const colorAttr = pointsRef.current.geometry.attributes.color;
    const positions = positionAttr.array;
    const colors = colorAttr.array;
    
    animationRef.current.time += delta;
    const time = animationRef.current.time;
    const easedProgress = easeInOutCubic(transitionProgress);

    const sourcePositions = currentImage?.positions || new Float32Array(CONFIG.particleCount * 3);
    const sourceColors = currentImage?.colors || new Float32Array(CONFIG.particleCount * 3);
    const targetPositions = nextImage?.positions || sourcePositions;
    const targetColors = nextImage?.colors || sourceColors;

    for (let i = 0; i < CONFIG.particleCount; i++) {
      const idx = i * 3;
      const sx = sourcePositions[idx] || 0;
      const sy = sourcePositions[idx + 1] || 0;
      const sz = sourcePositions[idx + 2] || 0;
      const tx = targetPositions[idx] || sx;
      const ty = targetPositions[idx + 1] || sy;
      const tz = targetPositions[idx + 2] || sz;

      // Morph transition (add other styles as needed)
      positions[idx] = sx + (tx - sx) * easedProgress;
      positions[idx + 1] = sy + (ty - sy) * easedProgress;
      positions[idx + 2] = sz + (tz - sz) * easedProgress;

      colors[idx] = sourceColors[idx] + (targetColors[idx] - sourceColors[idx]) * easedProgress;
      colors[idx + 1] = sourceColors[idx + 1] + (targetColors[idx + 1] - sourceColors[idx + 1]) * easedProgress;
      colors[idx + 2] = sourceColors[idx + 2] + (targetColors[idx + 2] - sourceColors[idx + 2]) * easedProgress;
    }

    positionAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(CONFIG.particleCount * 3), 3));
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(CONFIG.particleCount * 3), 3));
    return geo;
  }, []);

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial size={CONFIG.particleSize * 0.015} vertexColors transparent opacity={0.95} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function CameraController() {
  const { camera } = useThree();
  useEffect(() => { camera.position.set(0, 0, 5); }, [camera]);
  return <OrbitControls enablePan enableZoom enableRotate minDistance={2} maxDistance={20} autoRotate={CONFIG.autoRotate} autoRotateSpeed={0.5} />;
}

export default function ParticleAnimation() {
  const [images, setImages] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      const states = [];
      for (const url of CONFIG.images) {
        try {
          const data = await loadImageData(url);
          const { positions, colors } = generateParticlesFromImage(data, CONFIG.particleCount);
          states.push({ data, positions, colors });
        } catch (error) {
          console.error('Failed to load image:', url, error);
        }
      }
      setImages(states);
    };
    loadImages();
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime(prev => (prev + 0.016) >= CONFIG.duration ? 0 : prev + 0.016);
    }, 16);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} dpr={[1, 2]}>
        <color attach="background" args={[CONFIG.backgroundColor]} />
        <fog attach="fog" args={[CONFIG.backgroundColor, 8, 20]} />
        <PerspectiveCamera makeDefault fov={60} near={0.1} far={100} />
        <CameraController />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <ParticleSystem images={images} currentTime={currentTime} />
      </Canvas>
      <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)' }}>
        <button onClick={() => setIsPlaying(!isPlaying)} style={{ padding: '10px 20px', fontSize: '16px' }}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    </div>
  );
}
`;
  };

  const generateVanillaCode = () => {
    return `// ${projectName} - Particle Animation (Vanilla Three.js)
// Generated with Particle Studio
// Dependencies: npm install three

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const CONFIG = {
  particleCount: ${settings.particleCount},
  particleSize: ${settings.particleSize},
  backgroundColor: '${settings.backgroundColor}',
  autoRotate: ${settings.autoRotate},
};

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(CONFIG.backgroundColor);
scene.fog = new THREE.Fog(CONFIG.backgroundColor, 8, 20);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = CONFIG.autoRotate;
controls.autoRotateSpeed = 0.5;

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Particles
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(CONFIG.particleCount * 3);
const colors = new Float32Array(CONFIG.particleCount * 3);

for (let i = 0; i < CONFIG.particleCount; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const radius = 2 + Math.random() * 0.5;
  
  positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  positions[i * 3 + 2] = radius * Math.cos(phi);
  
  colors[i * 3] = 0.3;
  colors[i * 3 + 1] = 0.7;
  colors[i * 3 + 2] = 0.9;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
  size: CONFIG.particleSize * 0.015,
  vertexColors: true,
  transparent: true,
  opacity: 0.95,
  sizeAttenuation: true,
  depthWrite: false,
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

// Animation
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
`;
  };

  const generateHTMLCode = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName} - Particle Animation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { overflow: hidden; background: ${settings.backgroundColor}; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script type="importmap">
    {
      "imports": {
        "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
        "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
      }
    }
  </script>
  <script type="module">
    import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

    const CONFIG = {
      particleCount: ${settings.particleCount},
      particleSize: ${settings.particleSize},
      backgroundColor: '${settings.backgroundColor}',
      autoRotate: ${settings.autoRotate},
    };

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.backgroundColor);
    scene.fog = new THREE.Fog(CONFIG.backgroundColor, 8, 20);

    const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = CONFIG.autoRotate;

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const light = new THREE.PointLight(0xffffff, 0.5);
    light.position.set(10, 10, 10);
    scene.add(light);

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(CONFIG.particleCount * 3);
    const colors = new Float32Array(CONFIG.particleCount * 3);

    for (let i = 0; i < CONFIG.particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2 + Math.random() * 0.5;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      colors[i * 3] = 0.3;
      colors[i * 3 + 1] = 0.7;
      colors[i * 3 + 2] = 0.9;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: CONFIG.particleSize * 0.015,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      sizeAttenuation: true,
    });

    scene.add(new THREE.Points(geometry, material));

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    addEventListener('resize', () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });
  </script>
</body>
</html>`;
  };

  const getCode = () => {
    switch (format) {
      case 'react': return generateReactCode();
      case 'vanilla': return generateVanillaCode();
      case 'html': return generateHTMLCode();
    }
  };

  const getFileExtension = () => {
    switch (format) {
      case 'react': return 'jsx';
      case 'vanilla': return 'js';
      case 'html': return 'html';
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copied!',
      description: 'Code copied to clipboard.',
    });
  };

  const handleDownload = () => {
    const code = getCode();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-particles.${getFileExtension()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Downloaded!',
      description: `Code exported as ${format.toUpperCase()}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Code2 className="h-3.5 w-3.5 mr-1.5" />
          Export Code
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[85vh] sm:max-h-[80vh] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Export Code</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Download your particle animation as reusable code
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-2 block">Format</Label>
              <Select value={format} onValueChange={(v: ExportFormat) => setFormat(v)}>
                <SelectTrigger className="h-9 sm:h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="react">React + Three.js</SelectItem>
                  <SelectItem value="vanilla">Vanilla JavaScript</SelectItem>
                  <SelectItem value="html">Standalone HTML</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1 sm:flex-none">
                {copied ? <Check className="h-4 w-4 mr-1.5 sm:mr-0" /> : <Copy className="h-4 w-4 mr-1.5 sm:mr-0" />}
                <span className="sm:hidden">{copied ? 'Copied' : 'Copy'}</span>
              </Button>
              <Button size="sm" onClick={handleDownload} className="flex-1 sm:flex-none">
                <Download className="h-4 w-4 mr-1.5" />
                Download
              </Button>
            </div>
          </div>

          <div className="relative">
            <pre className="bg-muted/50 rounded-lg p-3 sm:p-4 text-[10px] sm:text-xs overflow-auto max-h-60 sm:max-h-96 font-mono">
              <code>{getCode()}</code>
            </pre>
          </div>

          <div className="text-[10px] sm:text-xs text-muted-foreground">
            {format === 'react' && (
              <p>Install: <code className="bg-muted px-1 rounded text-[10px] sm:text-xs">npm install three @react-three/fiber @react-three/drei</code></p>
            )}
            {format === 'vanilla' && (
              <p>Install: <code className="bg-muted px-1 rounded text-[10px] sm:text-xs">npm install three</code></p>
            )}
            {format === 'html' && (
              <p>No dependencies needed - uses CDN imports. Just open in a browser!</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
