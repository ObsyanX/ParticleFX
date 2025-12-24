import { useState, useEffect, useRef } from 'react';
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
import { Input } from '@/components/ui/input';
import { Code2, Download, Copy, Check, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ParticleSettings } from './ParticleControls';
import { Asset } from '@/hooks/useProjectAssets';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import xml from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/github-dark.css';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('xml', xml);

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
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedCode, setHighlightedCode] = useState('');
  const codeRef = useRef<HTMLPreElement>(null);
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
      positions[i * 3] = (pixel.x / width - 0.5) * scaleX;
      positions[i * 3 + 1] = -(pixel.y / height - 0.5) * scaleY;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
      colors[i * 3] = pixel.r;
      colors[i * 3 + 1] = pixel.g;
      colors[i * 3 + 2] = pixel.b;
    }
  }

  return { positions, colors };
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
      <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
        <color attach="background" args={[CONFIG.backgroundColor]} />
        <PerspectiveCamera makeDefault fov={60} near={0.1} far={100} />
        <OrbitControls autoRotate={CONFIG.autoRotate} />
        <ambientLight intensity={0.3} />
      </Canvas>
    </div>
  );
}
`;
  };

  const generateVanillaCode = () => {
    return `// ${projectName} - Particle Animation (Vanilla Three.js)
// Dependencies: npm install three

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const CONFIG = {
  particleCount: ${settings.particleCount},
  particleSize: ${settings.particleSize},
  backgroundColor: '${settings.backgroundColor}',
  autoRotate: ${settings.autoRotate},
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(CONFIG.backgroundColor);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = CONFIG.autoRotate;

scene.add(new THREE.AmbientLight(0xffffff, 0.3));

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
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
    * { margin: 0; padding: 0; }
    body { overflow: hidden; background: ${settings.backgroundColor}; }
  </style>
</head>
<body>
  <script type="importmap">
    { "imports": { "three": "https://unpkg.com/three@0.160.0/build/three.module.js" } }
  </script>
  <script type="module">
    import * as THREE from 'three';
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('${settings.backgroundColor}');
    
    const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
    camera.position.set(0, 0, 5);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(innerWidth, innerHeight);
    document.body.appendChild(renderer.domElement);
    
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();
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

  // Apply syntax highlighting
  useEffect(() => {
    const code = getCode();
    const language = format === 'html' ? 'xml' : 'javascript';
    const highlighted = hljs.highlight(code, { language }).value;
    setHighlightedCode(highlighted);
  }, [format, settings, assets]);

  // Search and highlight matches
  const getDisplayCode = () => {
    if (!searchQuery) return highlightedCode;
    
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return highlightedCode.replace(regex, '<mark class="bg-yellow-500/50 text-foreground">$1</mark>');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!', description: 'Code copied to clipboard.' });
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
    toast({ title: 'Downloaded!', description: `Code exported as ${format.toUpperCase()}.` });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Code2 className="h-3.5 w-3.5 mr-1.5" />
          Export Code
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[85vh] sm:max-h-[80vh] p-4 sm:p-6 flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-base sm:text-lg">Export Code</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Download your particle animation as reusable code
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col gap-3 sm:gap-4 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 flex-shrink-0">
            <div className="flex-1 min-w-0">
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
            
            <div className="flex gap-2 flex-shrink-0">
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

          {/* Search */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <pre 
              ref={codeRef}
              className="bg-muted/50 rounded-lg p-3 sm:p-4 text-[10px] sm:text-xs overflow-auto h-full max-h-full font-mono"
            >
              <code 
                className="hljs break-words whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: getDisplayCode() }}
              />
            </pre>
          </div>

          <div className="text-[10px] sm:text-xs text-muted-foreground flex-shrink-0">
            {format === 'react' && (
              <p className="break-words">Install: <code className="bg-muted px-1 rounded text-[10px] sm:text-xs break-all">npm install three @react-three/fiber @react-three/drei</code></p>
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
