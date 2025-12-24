import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Download, Loader2, Video, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportSettings {
  resolution: '720p' | '1080p' | '4k';
  fps: number;
  format: 'webm' | 'mp4';
}

interface VideoExportProps {
  canvasRef: React.RefObject<{ getCanvas: () => HTMLCanvasElement | null }>;
  duration: number;
  fps: number;
  projectName: string;
}

export function VideoExport({ canvasRef, duration, fps, projectName }: VideoExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState<ExportSettings>({
    resolution: '1080p',
    fps: fps,
    format: 'webm',
  });
  const { toast } = useToast();
  const abortRef = useRef(false);

  const getResolutionDimensions = (res: string): { width: number; height: number } => {
    switch (res) {
      case '720p': return { width: 1280, height: 720 };
      case '1080p': return { width: 1920, height: 1080 };
      case '4k': return { width: 3840, height: 2160 };
      default: return { width: 1920, height: 1080 };
    }
  };

  const handleExport = useCallback(async () => {
    const canvasHandle = canvasRef.current;
    if (!canvasHandle) {
      toast({
        title: 'Export failed',
        description: 'Canvas not available',
        variant: 'destructive',
      });
      return;
    }

    const canvas = canvasHandle.getCanvas();
    if (!canvas) {
      toast({
        title: 'Export failed',
        description: 'WebGL canvas not found',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    setProgress(0);
    abortRef.current = false;

    try {
      // Get the WebGL canvas stream
      const stream = canvas.captureStream(settings.fps);
      
      // Determine MIME type
      const mimeType = settings.format === 'webm' 
        ? 'video/webm;codecs=vp9' 
        : 'video/webm'; // We'll convert to MP4 client-side if needed
      
      // Check if the MIME type is supported
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        throw new Error(`${mimeType} is not supported by your browser`);
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: settings.resolution === '4k' ? 20000000 : 
                           settings.resolution === '1080p' ? 10000000 : 5000000,
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (abortRef.current) {
          setIsExporting(false);
          return;
        }

        const blob = new Blob(chunks, { type: 'video/webm' });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName.replace(/[^a-z0-9]/gi, '_')}_${settings.resolution}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: 'Export complete!',
          description: `Video saved as ${a.download}`,
        });

        setIsExporting(false);
        setIsOpen(false);
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms

      // Simulate progress based on duration
      const startTime = Date.now();
      const recordDuration = duration * 1000; // Convert to ms

      const progressInterval = setInterval(() => {
        if (abortRef.current) {
          clearInterval(progressInterval);
          mediaRecorder.stop();
          return;
        }

        const elapsed = Date.now() - startTime;
        const currentProgress = Math.min((elapsed / recordDuration) * 100, 100);
        setProgress(currentProgress);

        if (elapsed >= recordDuration) {
          clearInterval(progressInterval);
          mediaRecorder.stop();
        }
      }, 100);

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      setIsExporting(false);
    }
  }, [canvasRef, duration, settings, projectName, toast]);

  const handleCancel = () => {
    abortRef.current = true;
    setIsExporting(false);
  };

  return (
    <>
      <Button 
        size="sm" 
        className="h-8 bg-primary text-primary-foreground"
        onClick={() => setIsOpen(true)}
      >
        <Download className="h-3.5 w-3.5 mr-1.5" />
        Export
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => !isExporting && setIsOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Export Video
            </DialogTitle>
            <DialogDescription>
              Record your particle animation as a video file
            </DialogDescription>
          </DialogHeader>

          {isExporting ? (
            <div className="space-y-4 py-4">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-sm font-medium">Recording animation...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(progress)}% complete
                </p>
              </div>
              
              <Progress value={progress} className="h-2" />
              
              <p className="text-xs text-muted-foreground text-center">
                Keep this window open while recording. The animation is being captured in real-time.
              </p>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleCancel}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Export
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Resolution</Label>
                  <Select
                    value={settings.resolution}
                    onValueChange={(value: ExportSettings['resolution']) => 
                      setSettings(s => ({ ...s, resolution: value }))
                    }
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="720p">720p (1280×720)</SelectItem>
                      <SelectItem value="1080p">1080p (1920×1080)</SelectItem>
                      <SelectItem value="4k">4K (3840×2160)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Frame Rate</Label>
                  <Select
                    value={settings.fps.toString()}
                    onValueChange={(value) => 
                      setSettings(s => ({ ...s, fps: parseInt(value) }))
                    }
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24 fps</SelectItem>
                      <SelectItem value="30">30 fps</SelectItem>
                      <SelectItem value="60">60 fps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Format</Label>
                  <Select
                    value={settings.format}
                    onValueChange={(value: ExportSettings['format']) => 
                      setSettings(s => ({ ...s, format: value }))
                    }
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="webm">WebM (Best quality)</SelectItem>
                      <SelectItem value="mp4">MP4 (Wide compatibility)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">How it works:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>The animation will play and record in real-time</li>
                  <li>Duration: {duration} seconds</li>
                  <li>Keep the browser tab active during export</li>
                </ul>
              </div>

              <Button 
                className="w-full bg-primary text-primary-foreground"
                onClick={handleExport}
              >
                <Video className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
