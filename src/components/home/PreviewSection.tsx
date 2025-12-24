import { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { ScrollReveal } from '@/hooks/useScrollReveal';
import * as THREE from 'three';

function MorphingParticles({ isPlaying }: { isPlaying: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 5000;
  const timeRef = useRef(0);

  const [positions, targetPositions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const targetPositions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    // Create sphere shape
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 2 + Math.random() * 0.5;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Create cube target
      targetPositions[i * 3] = (Math.random() - 0.5) * 4;
      targetPositions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      targetPositions[i * 3 + 2] = (Math.random() - 0.5) * 4;

      // Gradient colors
      const t = i / count;
      colors[i * 3] = 0.2 + t * 0.8;
      colors[i * 3 + 1] = 0.8 - t * 0.4;
      colors[i * 3 + 2] = 1;
    }

    return [positions, targetPositions, colors];
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current || !isPlaying) return;

    timeRef.current += delta * 0.5;
    const t = (Math.sin(timeRef.current) + 1) / 2;

    const positionsAttr = pointsRef.current.geometry.attributes.position;
    const posArray = positionsAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      posArray[i * 3] = THREE.MathUtils.lerp(positions[i * 3], targetPositions[i * 3], t);
      posArray[i * 3 + 1] = THREE.MathUtils.lerp(positions[i * 3 + 1], targetPositions[i * 3 + 1], t);
      posArray[i * 3 + 2] = THREE.MathUtils.lerp(positions[i * 3 + 2], targetPositions[i * 3 + 2], t);
    }

    positionsAttr.needsUpdate = true;
    pointsRef.current.rotation.y += delta * 0.2;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions.slice(), 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  );
}

export function PreviewSection() {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <section id="preview" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Live Preview</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            See the Magic{' '}
            <span className="text-gradient">In Action</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            What you see is rendered live in the browser using WebGL. No pre-recorded videos.
          </p>
        </ScrollReveal>

        {/* Preview window */}
        <ScrollReveal delay={0.2} className="relative max-w-5xl mx-auto">
          {/* Mock browser chrome */}
          <div className="rounded-t-xl bg-card border border-border/50 border-b-0 p-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-destructive/50" />
              <div className="h-3 w-3 rounded-full bg-warning/50" />
              <div className="h-3 w-3 rounded-full bg-success/50" />
            </div>
            <div className="flex-1 mx-4">
              <div className="h-6 rounded-lg bg-muted/50 flex items-center px-3">
                <span className="text-xs text-muted-foreground">particlefx.app/editor</span>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="relative aspect-video rounded-b-xl overflow-hidden border border-border/50 border-t-0 bg-[#0a0a12]">
            <Canvas
              camera={{ position: [0, 0, 6], fov: 60 }}
              gl={{ antialias: true }}
            >
              <color attach="background" args={['#0a0a12']} />
              <ambientLight intensity={0.5} />
              <MorphingParticles isPlaying={isPlaying} />
            </Canvas>

            {/* Play/Pause overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-3">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-10 w-10 p-0 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 ml-0.5" />
                )}
              </Button>
              <span className="text-sm text-foreground/80 bg-background/60 backdrop-blur-sm px-3 py-1 rounded-full">
                {isPlaying ? 'Live Preview' : 'Paused'}
              </span>
            </div>

            {/* FPS indicator */}
            <div className="absolute top-4 right-4 text-xs text-muted-foreground bg-background/60 backdrop-blur-sm px-2 py-1 rounded">
              60 FPS
            </div>
          </div>

          {/* Glow effect */}
          <div className="absolute inset-0 -z-10 rounded-xl bg-primary/20 blur-3xl opacity-30" />
        </ScrollReveal>
      </div>
    </section>
  );
}