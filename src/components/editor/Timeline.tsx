import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Asset } from '@/hooks/useProjectAssets';
import { cn } from '@/lib/utils';

interface TimelineProps {
  assets: Asset[];
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  onTimeChange: (time: number) => void;
  onPlayPause: () => void;
  onAssetSelect: (assetId: string) => void;
  selectedAssetId: string | null;
}

export function Timeline({
  assets,
  duration,
  currentTime,
  isPlaying,
  onTimeChange,
  onPlayPause,
  onAssetSelect,
  selectedAssetId,
}: TimelineProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const transitionDuration = assets.length > 1 ? duration / (assets.length - 1) : duration;

  return (
    <div className="h-full flex flex-col">
      {/* Controls row */}
      <div className="flex items-center gap-4 mb-3">
        {/* Playback controls */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => onTimeChange(0)}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20"
            onClick={onPlayPause}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 text-primary" />
            ) : (
              <Play className="h-5 w-5 text-primary ml-0.5" />
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => onTimeChange(duration)}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Time display */}
        <div className="text-sm font-mono text-muted-foreground">
          <span className="text-foreground">{formatTime(currentTime)}</span>
          <span className="mx-1">/</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Scrubber */}
        <div className="flex-1">
          <Slider
            value={[currentTime]}
            onValueChange={([value]) => onTimeChange(value)}
            min={0}
            max={duration}
            step={0.01}
            className="w-full"
          />
        </div>
      </div>

      {/* Asset timeline track */}
      <div className="flex-1 bg-muted/30 rounded-lg border border-border/50 p-2 overflow-hidden">
        {assets.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            Upload images to create a timeline
          </div>
        ) : (
          <div className="flex gap-1 h-full">
            {assets.map((asset, index) => {
              const isSelected = asset.id === selectedAssetId;
              const startTime = index * transitionDuration;
              const width = assets.length === 1 ? 100 : (1 / assets.length) * 100;
              
              return (
                <div
                  key={asset.id}
                  className={cn(
                    "relative h-full rounded-md overflow-hidden cursor-pointer border-2 transition-all",
                    isSelected 
                      ? "border-primary ring-1 ring-primary/30" 
                      : "border-transparent hover:border-primary/50"
                  )}
                  style={{ width: `${width}%` }}
                  onClick={() => onAssetSelect(asset.id)}
                >
                  <img
                    src={asset.file_url}
                    alt={asset.file_name || 'Asset'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-1 left-1 right-1">
                      <p className="text-[10px] text-white truncate">
                        {asset.file_name || `Image ${index + 1}`}
                      </p>
                    </div>
                  </div>
                  
                  {/* Time marker */}
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/70 rounded text-[9px] text-white font-mono">
                    {formatTime(startTime)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Playhead */}
        {assets.length > 0 && (
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-primary shadow-lg shadow-primary/50 pointer-events-none"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
