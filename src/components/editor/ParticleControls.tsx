import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { RotateCcw } from 'lucide-react';

export interface ParticleSettings {
  particleCount: number;
  particleSize: number;
  transitionStyle: 'morph' | 'explode' | 'swirl' | 'wave' | 'depth';
  transitionDuration: number;
  duration: number;
  fps: number;
  backgroundColor: string;
  autoRotate: boolean;
  depthEnabled: boolean;
}

export const defaultSettings: ParticleSettings = {
  particleCount: 50000,
  particleSize: 2,
  transitionStyle: 'morph',
  transitionDuration: 2,
  duration: 10,
  fps: 60,
  backgroundColor: '#0a0a0f',
  autoRotate: false,
  depthEnabled: false,
};

interface ParticleControlsProps {
  settings: ParticleSettings;
  onSettingsChange: (settings: Partial<ParticleSettings>) => void;
  onReset?: () => void;
}

export function ParticleControls({ settings, onSettingsChange, onReset }: ParticleControlsProps) {
  return (
    <div className="space-y-6">
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

      {/* Transition Settings */}
      <div>
        <h3 className="text-sm font-medium mb-3">Transition</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Style</Label>
            <Select
              value={settings.transitionStyle}
              onValueChange={(value: ParticleSettings['transitionStyle']) => 
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
                <SelectItem value="24">24 fps - Cinematic</SelectItem>
                <SelectItem value="30">30 fps - Standard</SelectItem>
                <SelectItem value="60">60 fps - Smooth</SelectItem>
              </SelectContent>
            </Select>
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
        </div>
      </div>
    </div>
  );
}
