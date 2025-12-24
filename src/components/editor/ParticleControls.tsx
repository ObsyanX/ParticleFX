import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface ParticleSettings {
  particleCount: number;
  particleSize: number;
  transitionStyle: string;
  duration: number;
  fps: number;
  backgroundColor: string;
}

interface ParticleControlsProps {
  settings: ParticleSettings;
  onSettingsChange: (settings: Partial<ParticleSettings>) => void;
}

export function ParticleControls({ settings, onSettingsChange }: ParticleControlsProps) {
  return (
    <div className="space-y-6">
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
              onValueChange={(value) => onSettingsChange({ transitionStyle: value })}
            >
              <SelectTrigger className="h-9 bg-input/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morph">Morph</SelectItem>
                <SelectItem value="explode">Explode</SelectItem>
                <SelectItem value="swirl">Swirl</SelectItem>
                <SelectItem value="wave">Wave</SelectItem>
                <SelectItem value="depth">Depth Push</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Timeline Settings */}
      <div>
        <h3 className="text-sm font-medium mb-3">Timeline</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Duration (seconds)</Label>
            <Input
              type="number"
              value={settings.duration}
              onChange={(e) => onSettingsChange({ duration: parseInt(e.target.value) || 10 })}
              min={1}
              max={60}
              className="h-9 bg-input/50"
            />
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">FPS</Label>
            <Select
              value={settings.fps.toString()}
              onValueChange={(value) => onSettingsChange({ fps: parseInt(value) })}
            >
              <SelectTrigger className="h-9 bg-input/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24 fps</SelectItem>
                <SelectItem value="30">30 fps</SelectItem>
                <SelectItem value="60">60 fps</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Background */}
      <div>
        <h3 className="text-sm font-medium mb-3">Background</h3>
        <div className="flex items-center gap-3">
          <div 
            className="h-9 w-9 rounded-md border border-border/50 cursor-pointer"
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
          />
        </div>
      </div>
    </div>
  );
}
