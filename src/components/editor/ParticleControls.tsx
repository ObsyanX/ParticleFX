import { useCallback, useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { RotateCcw, Image, Palette, Upload, Loader2, Flame, Droplets, Sparkles, Wind } from 'lucide-react';

export type TransitionStyle = 'morph' | 'explode' | 'swirl' | 'wave' | 'depth' | 'dissolve' | 'spiral' | 'gravity' | 'vortex' | 'pixelate' | 'shatter' | 'magnetic' | 'ripple' | 'scatter' | 'tornado';
export type BackgroundType = 'color' | 'gradient' | 'image';

export interface ParticleSettings {
  particleCount: number;
  particleSize: number;
  transitionStyle: TransitionStyle;
  transitionDuration: number;
  duration: number;
  fps: number;
  backgroundColor: string;
  backgroundType: BackgroundType;
  backgroundGradient: string;
  backgroundImage: string;
  autoRotate: boolean;
  depthEnabled: boolean;
  loop: boolean;
  colorContrast: number;
  colorSaturation: number;
  colorBrightness: number;
}

export const defaultSettings: ParticleSettings = {
  particleCount: 50000,
  particleSize: 2,
  transitionStyle: 'morph',
  transitionDuration: 2,
  duration: 10,
  fps: 60,
  backgroundColor: '#0a0a0f',
  backgroundType: 'color',
  backgroundGradient: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
  backgroundImage: '',
  autoRotate: false,
  depthEnabled: false,
  loop: true,
  colorContrast: 1.0,
  colorSaturation: 1.0,
  colorBrightness: 1.0,
};

interface ParticleControlsProps {
  settings: ParticleSettings;
  onSettingsChange: (settings: Partial<ParticleSettings>) => void;
  onReset?: () => void;
  onUploadBackgroundImage?: (files: File[]) => Promise<string | undefined>;
}

// Animation presets
const presets: { name: string; icon: React.ReactNode; settings: Partial<ParticleSettings> }[] = [
  {
    name: 'Fire',
    icon: <Flame className="h-4 w-4" />,
    settings: {
      transitionStyle: 'gravity',
      colorContrast: 1.5,
      colorSaturation: 1.8,
      colorBrightness: 1.3,
      backgroundColor: '#1a0a00',
      backgroundType: 'gradient',
      backgroundGradient: 'radial-gradient(ellipse at bottom, #4a1500 0%, #0a0000 70%)',
      particleSize: 2.5,
      autoRotate: false,
      depthEnabled: true,
    },
  },
  {
    name: 'Water',
    icon: <Droplets className="h-4 w-4" />,
    settings: {
      transitionStyle: 'ripple',
      colorContrast: 1.2,
      colorSaturation: 1.4,
      colorBrightness: 1.1,
      backgroundColor: '#001020',
      backgroundType: 'gradient',
      backgroundGradient: 'linear-gradient(180deg, #001525 0%, #00354a 50%, #001020 100%)',
      particleSize: 1.8,
      autoRotate: false,
      depthEnabled: true,
    },
  },
  {
    name: 'Galaxy',
    icon: <Sparkles className="h-4 w-4" />,
    settings: {
      transitionStyle: 'vortex',
      colorContrast: 1.4,
      colorSaturation: 1.6,
      colorBrightness: 1.4,
      backgroundColor: '#0a0015',
      backgroundType: 'gradient',
      backgroundGradient: 'radial-gradient(ellipse at center, #1a0030 0%, #0a0015 50%, #050010 100%)',
      particleSize: 1.5,
      autoRotate: true,
      depthEnabled: true,
    },
  },
  {
    name: 'Aurora',
    icon: <Wind className="h-4 w-4" />,
    settings: {
      transitionStyle: 'wave',
      colorContrast: 1.3,
      colorSaturation: 1.5,
      colorBrightness: 1.2,
      backgroundColor: '#001010',
      backgroundType: 'gradient',
      backgroundGradient: 'linear-gradient(180deg, #000510 0%, #001515 40%, #002020 100%)',
      particleSize: 2.0,
      autoRotate: false,
      depthEnabled: false,
    },
  },
];

export function ParticleControls({ settings, onSettingsChange, onReset, onUploadBackgroundImage }: ParticleControlsProps) {
  const [uploadingBg, setUploadingBg] = useState(false);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  const handleBgFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length > 0 && onUploadBackgroundImage) {
      setUploadingBg(true);
      try {
        const url = await onUploadBackgroundImage(files);
        if (url) {
          onSettingsChange({ backgroundImage: url, backgroundType: 'image' });
        }
      } finally {
        setUploadingBg(false);
      }
    }
    
    e.target.value = '';
  }, [onUploadBackgroundImage, onSettingsChange]);
  return (
    <div className="space-y-6">
      {/* Animation Presets */}
      <div>
        <h3 className="text-sm font-medium mb-3">Presets</h3>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              className="h-10 justify-start gap-2"
              onClick={() => onSettingsChange(preset.settings)}
            >
              {preset.icon}
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Reset Button */}
      {onReset && (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={onReset}
        >
          <RotateCcw className="h-3.5 w-3.5 mr-2" />
          Reset to Defaults
        </Button>
      )}

      {/* Particle Settings */}
      <div>
        <h3 className="text-sm font-medium mb-3">Particles</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-muted-foreground">Count</Label>
              <span className="text-xs font-mono text-muted-foreground">
                {settings.particleCount.toLocaleString()}
              </span>
            </div>
            <Slider
              value={[settings.particleCount]}
              onValueChange={([value]) => onSettingsChange({ particleCount: value })}
              min={5000}
              max={100000}
              step={5000}
              className="w-full"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-muted-foreground">Size</Label>
              <span className="text-xs font-mono text-muted-foreground">
                {settings.particleSize.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[settings.particleSize]}
              onValueChange={([value]) => onSettingsChange({ particleSize: value })}
              min={0.5}
              max={5}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Depth Effect</Label>
            <Switch
              checked={settings.depthEnabled}
              onCheckedChange={(checked) => onSettingsChange({ depthEnabled: checked })}
            />
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Color Enhancement */}
      <div>
        <h3 className="text-sm font-medium mb-3">Color Enhancement</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-muted-foreground">Contrast</Label>
              <span className="text-xs font-mono text-muted-foreground">
                {settings.colorContrast.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[settings.colorContrast]}
              onValueChange={([value]) => onSettingsChange({ colorContrast: value })}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-muted-foreground">Saturation</Label>
              <span className="text-xs font-mono text-muted-foreground">
                {settings.colorSaturation.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[settings.colorSaturation]}
              onValueChange={([value]) => onSettingsChange({ colorSaturation: value })}
              min={0.0}
              max={2.0}
              step={0.1}
              className="w-full"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-muted-foreground">Brightness</Label>
              <span className="text-xs font-mono text-muted-foreground">
                {settings.colorBrightness.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[settings.colorBrightness]}
              onValueChange={([value]) => onSettingsChange({ colorBrightness: value })}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Transition Settings */}
      <div>
        <h3 className="text-sm font-medium mb-3">Transition</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Style</Label>
            <Select
              value={settings.transitionStyle}
              onValueChange={(value: TransitionStyle) => 
                onSettingsChange({ transitionStyle: value })
              }
            >
              <SelectTrigger className="h-9 bg-input/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morph">Morph - Smooth blend</SelectItem>
                <SelectItem value="explode">Explode - Scatter & reform</SelectItem>
                <SelectItem value="swirl">Swirl - Spiral motion</SelectItem>
                <SelectItem value="wave">Wave - Ripple effect</SelectItem>
                <SelectItem value="depth">Depth Push - Z-axis zoom</SelectItem>
                <SelectItem value="dissolve">Dissolve - Fade particles</SelectItem>
                <SelectItem value="spiral">Spiral - Circular motion</SelectItem>
                <SelectItem value="gravity">Gravity - Fall & rise</SelectItem>
                <SelectItem value="vortex">Vortex - Tunnel effect</SelectItem>
                <SelectItem value="pixelate">Pixelate - Grid shuffle</SelectItem>
                <SelectItem value="shatter">Shatter - Glass break</SelectItem>
                <SelectItem value="magnetic">Magnetic - Attract & repel</SelectItem>
                <SelectItem value="ripple">Ripple - Water drop</SelectItem>
                <SelectItem value="scatter">Scatter - Random spread</SelectItem>
                <SelectItem value="tornado">Tornado - Funnel spin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-muted-foreground">Transition Duration</Label>
              <span className="text-xs font-mono text-muted-foreground">
                {settings.transitionDuration.toFixed(1)}s
              </span>
            </div>
            <Slider
              value={[settings.transitionDuration]}
              onValueChange={([value]) => onSettingsChange({ transitionDuration: value })}
              min={0.5}
              max={5}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Timeline Settings */}
      <div>
        <h3 className="text-sm font-medium mb-3">Timeline</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-muted-foreground">Total Duration</Label>
              <span className="text-xs font-mono text-muted-foreground">
                {settings.duration}s
              </span>
            </div>
            <Slider
              value={[settings.duration]}
              onValueChange={([value]) => onSettingsChange({ duration: value })}
              min={5}
              max={60}
              step={1}
              className="w-full"
            />
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Frame Rate</Label>
            <Select
              value={settings.fps.toString()}
              onValueChange={(value) => onSettingsChange({ fps: parseInt(value) })}
            >
              <SelectTrigger className="h-9 bg-input/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 fps - Retro</SelectItem>
                <SelectItem value="15">15 fps - Low</SelectItem>
                <SelectItem value="24">24 fps - Cinematic</SelectItem>
                <SelectItem value="25">25 fps - PAL</SelectItem>
                <SelectItem value="30">30 fps - Standard</SelectItem>
                <SelectItem value="48">48 fps - HFR</SelectItem>
                <SelectItem value="60">60 fps - Smooth</SelectItem>
                <SelectItem value="120">120 fps - Ultra</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Loop Animation</Label>
            <Switch
              checked={settings.loop}
              onCheckedChange={(checked) => onSettingsChange({ loop: checked })}
            />
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Camera Settings */}
      <div>
        <h3 className="text-sm font-medium mb-3">Camera</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Auto Rotate</Label>
            <Switch
              checked={settings.autoRotate}
              onCheckedChange={(checked) => onSettingsChange({ autoRotate: checked })}
            />
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Background */}
      <div>
        <h3 className="text-sm font-medium mb-3">Background</h3>
        <div className="space-y-3">
          {/* Background Type Selector */}
          <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
            <button
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-all ${
                settings.backgroundType === 'color' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              }`}
              onClick={() => onSettingsChange({ backgroundType: 'color' })}
            >
              <div className="h-3 w-3 rounded-sm bg-primary" />
              Color
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-all ${
                settings.backgroundType === 'gradient' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              }`}
              onClick={() => onSettingsChange({ backgroundType: 'gradient' })}
            >
              <Palette className="h-3 w-3" />
              Gradient
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-all ${
                settings.backgroundType === 'image' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              }`}
              onClick={() => onSettingsChange({ backgroundType: 'image' })}
            >
              <Image className="h-3 w-3" />
              Image
            </button>
          </div>

          {/* Color Background */}
          {settings.backgroundType === 'color' && (
            <>
              <div className="flex items-center gap-3">
                <div 
                  className="h-9 w-9 rounded-md border border-border/50 cursor-pointer overflow-hidden"
                  style={{ backgroundColor: settings.backgroundColor }}
                >
                  <input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => onSettingsChange({ backgroundColor: e.target.value })}
                    className="opacity-0 w-full h-full cursor-pointer"
                  />
                </div>
                <Input
                  value={settings.backgroundColor}
                  onChange={(e) => onSettingsChange({ backgroundColor: e.target.value })}
                  className="h-9 flex-1 font-mono text-xs bg-input/50"
                  placeholder="#000000"
                />
              </div>
              
              {/* Preset colors */}
              <div className="flex gap-2">
                {['#0a0a0f', '#1a1a2e', '#16213e', '#0f0f23', '#1e1e1e', '#2d132c'].map((color) => (
                  <button
                    key={color}
                    className="h-6 w-6 rounded-md border border-border/50 hover:ring-2 ring-primary/50 transition-all"
                    style={{ backgroundColor: color }}
                    onClick={() => onSettingsChange({ backgroundColor: color })}
                  />
                ))}
              </div>
            </>
          )}

          {/* Gradient Background */}
          {settings.backgroundType === 'gradient' && (
            <div className="space-y-3">
              <Input
                value={settings.backgroundGradient}
                onChange={(e) => onSettingsChange({ backgroundGradient: e.target.value })}
                className="h-9 font-mono text-xs bg-input/50"
                placeholder="linear-gradient(135deg, #000 0%, #333 100%)"
              />
              
              {/* Preset gradients */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
                  'linear-gradient(180deg, #0f0f23 0%, #2d132c 100%)',
                  'linear-gradient(45deg, #1e1e1e 0%, #0a0a0f 100%)',
                  'radial-gradient(circle, #1a1a2e 0%, #0a0a0f 100%)',
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                ].map((gradient, i) => (
                  <button
                    key={i}
                    className="h-8 rounded-md border border-border/50 hover:ring-2 ring-primary/50 transition-all"
                    style={{ background: gradient }}
                    onClick={() => onSettingsChange({ backgroundGradient: gradient })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Image Background */}
          {settings.backgroundType === 'image' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={settings.backgroundImage}
                  onChange={(e) => onSettingsChange({ backgroundImage: e.target.value })}
                  className="h-9 flex-1 font-mono text-xs bg-input/50"
                  placeholder="https://example.com/image.jpg"
                />
                <input
                  ref={bgFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBgFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3"
                  onClick={() => bgFileInputRef.current?.click()}
                  disabled={uploadingBg || !onUploadBackgroundImage}
                >
                  {uploadingBg ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {settings.backgroundImage && (
                <div 
                  className="h-20 rounded-md border border-border/50 bg-cover bg-center"
                  style={{ backgroundImage: `url(${settings.backgroundImage})` }}
                />
              )}
              <p className="text-[10px] text-muted-foreground">
                Upload an image or paste a URL
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
