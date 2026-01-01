import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Wand2, Play, Sparkles } from 'lucide-react';

export type PreAnimationType = 'none' | 'fade-in' | 'blur-clear' | 'scale-up' | 'slide-top' | 'slide-bottom' | 'slide-left' | 'slide-right' | 'zoom-fade';
export type PostAnimationType = 'none' | 'glow-pulse' | 'border-sweep' | 'fade-overlay' | 'scale-bounce' | 'shadow-expand';
export type EasingType = 'ease-out' | 'ease-in-out' | 'cubic-bezier' | 'linear' | 'spring';

export interface ImageAnimationSettings {
  // Pre-animation
  preAnimationEnabled: boolean;
  preAnimationType: PreAnimationType;
  preAnimationDuration: number;
  
  // Post-animation
  postAnimationEnabled: boolean;
  postAnimationType: PostAnimationType;
  postAnimationDuration: number;
  postAnimationDelay: number;
  
  // Global settings
  easingFunction: EasingType;
  replayOnScroll: boolean;
  replayOnHover: boolean;
  respectReducedMotion: boolean;
}

export const defaultImageAnimationSettings: ImageAnimationSettings = {
  preAnimationEnabled: true,
  preAnimationType: 'fade-in',
  preAnimationDuration: 500,
  postAnimationEnabled: false,
  postAnimationType: 'none',
  postAnimationDuration: 400,
  postAnimationDelay: 200,
  easingFunction: 'ease-out',
  replayOnScroll: false,
  replayOnHover: false,
  respectReducedMotion: true,
};

interface ImageAnimationControlsProps {
  settings: ImageAnimationSettings;
  onSettingsChange: (settings: Partial<ImageAnimationSettings>) => void;
}

const preAnimationOptions: { value: PreAnimationType; label: string; description: string }[] = [
  { value: 'none', label: 'None', description: 'No pre-animation' },
  { value: 'fade-in', label: 'Fade In', description: 'Smooth opacity transition' },
  { value: 'blur-clear', label: 'Blur → Clear', description: 'Blur dissolves to clarity' },
  { value: 'scale-up', label: 'Scale Up', description: 'Grows from 0.9 to 1' },
  { value: 'slide-top', label: 'Slide from Top', description: 'Enters from above' },
  { value: 'slide-bottom', label: 'Slide from Bottom', description: 'Enters from below' },
  { value: 'slide-left', label: 'Slide from Left', description: 'Enters from left' },
  { value: 'slide-right', label: 'Slide from Right', description: 'Enters from right' },
  { value: 'zoom-fade', label: 'Zoom + Fade', description: 'Cinematic reveal' },
];

const postAnimationOptions: { value: PostAnimationType; label: string; description: string }[] = [
  { value: 'none', label: 'None', description: 'No post-animation' },
  { value: 'glow-pulse', label: 'Glow Pulse', description: 'Subtle glowing effect' },
  { value: 'border-sweep', label: 'Border Sweep', description: 'Highlight sweeps around border' },
  { value: 'fade-overlay', label: 'Fade Overlay', description: 'Soft overlay appears' },
  { value: 'scale-bounce', label: 'Scale Bounce', description: 'Micro bounce (1→1.03→1)' },
  { value: 'shadow-expand', label: 'Shadow Expand', description: 'Shadow grows softly' },
];

const easingOptions: { value: EasingType; label: string }[] = [
  { value: 'ease-out', label: 'Ease Out (smooth)' },
  { value: 'ease-in-out', label: 'Ease In-Out' },
  { value: 'cubic-bezier', label: 'Cubic Bezier (cinematic)' },
  { value: 'linear', label: 'Linear' },
  { value: 'spring', label: 'Spring (bouncy)' },
];

export function ImageAnimationControls({ settings, onSettingsChange }: ImageAnimationControlsProps) {
  return (
    <div className="space-y-6">
      {/* Pre-Animation Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Wand2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Pre-Animation</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Enable Pre-Animation</Label>
            <Switch
              checked={settings.preAnimationEnabled}
              onCheckedChange={(checked) => onSettingsChange({ preAnimationEnabled: checked })}
            />
          </div>
          
          {settings.preAnimationEnabled && (
            <>
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Effect Type</Label>
                <Select
                  value={settings.preAnimationType}
                  onValueChange={(value: PreAnimationType) => 
                    onSettingsChange({ preAnimationType: value })
                  }
                >
                  <SelectTrigger className="h-9 bg-input/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {preAnimationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground">Duration</Label>
                  <span className="text-xs font-mono text-muted-foreground">
                    {settings.preAnimationDuration}ms
                  </span>
                </div>
                <Slider
                  value={[settings.preAnimationDuration]}
                  onValueChange={([value]) => onSettingsChange({ preAnimationDuration: value })}
                  min={100}
                  max={2000}
                  step={50}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Post-Animation Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-medium">Post-Animation</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Enable Post-Animation</Label>
            <Switch
              checked={settings.postAnimationEnabled}
              onCheckedChange={(checked) => onSettingsChange({ postAnimationEnabled: checked })}
            />
          </div>
          
          {settings.postAnimationEnabled && (
            <>
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Effect Type</Label>
                <Select
                  value={settings.postAnimationType}
                  onValueChange={(value: PostAnimationType) => 
                    onSettingsChange({ postAnimationType: value })
                  }
                >
                  <SelectTrigger className="h-9 bg-input/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {postAnimationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground">Duration</Label>
                  <span className="text-xs font-mono text-muted-foreground">
                    {settings.postAnimationDuration}ms
                  </span>
                </div>
                <Slider
                  value={[settings.postAnimationDuration]}
                  onValueChange={([value]) => onSettingsChange({ postAnimationDuration: value })}
                  min={100}
                  max={1500}
                  step={50}
                  className="w-full"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground">Delay After Main</Label>
                  <span className="text-xs font-mono text-muted-foreground">
                    {settings.postAnimationDelay}ms
                  </span>
                </div>
                <Slider
                  value={[settings.postAnimationDelay]}
                  onValueChange={([value]) => onSettingsChange({ postAnimationDelay: value })}
                  min={0}
                  max={1000}
                  step={50}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Global Animation Settings */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Play className="h-4 w-4 text-success" />
          <h3 className="text-sm font-medium">Animation Settings</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Easing Function</Label>
            <Select
              value={settings.easingFunction}
              onValueChange={(value: EasingType) => 
                onSettingsChange({ easingFunction: value })
              }
            >
              <SelectTrigger className="h-9 bg-input/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {easingOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Replay on Scroll</Label>
            <Switch
              checked={settings.replayOnScroll}
              onCheckedChange={(checked) => onSettingsChange({ replayOnScroll: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Replay on Hover</Label>
            <Switch
              checked={settings.replayOnHover}
              onCheckedChange={(checked) => onSettingsChange({ replayOnHover: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Respect Reduced Motion</Label>
            <Switch
              checked={settings.respectReducedMotion}
              onCheckedChange={(checked) => onSettingsChange({ respectReducedMotion: checked })}
            />
          </div>
        </div>
      </div>
      
      <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Animation Sequence:</strong> Pre-animation → Main animation → Post-animation. 
          All animations use GPU-accelerated properties (transform, opacity) for smooth performance.
        </p>
      </div>
    </div>
  );
}
