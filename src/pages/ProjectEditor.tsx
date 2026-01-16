import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useProjectAssets } from '@/hooks/useProjectAssets';
import { useHistory } from '@/hooks/useHistory';
import { useKeyboardShortcuts, KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AssetGallery } from '@/components/editor/AssetGallery';
import { ParticleCanvas, ParticleCanvasHandle } from '@/components/editor/ParticleCanvas';
import { ParticleControls, ParticleSettings, defaultSettings } from '@/components/editor/ParticleControls';
import { Timeline } from '@/components/editor/Timeline';
import { VideoExport } from '@/components/editor/VideoExport';
import { CodeExport } from '@/components/editor/CodeExport';
import { TemplateManager } from '@/components/editor/TemplateManager';
import { KeyboardShortcutsHelp } from '@/components/editor/KeyboardShortcutsHelp';
import {
  ArrowLeft, 
  Loader2, 
  Sparkles, 
  Save,
  PanelLeftClose,
  PanelRightClose,
  PanelLeft,
  PanelRight,
  Undo2,
  Redo2
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
}

export default function ProjectEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<ParticleCanvasHandle>(null);
  
  // Project state
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projectName, setProjectName] = useState('');
  
  // Panel visibility
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  
  // Assets
  const { 
    assets, 
    loading: assetsLoading, 
    uploading, 
    uploadMultipleAssets, 
    deleteAsset,
    reorderAssets,
    uploadToStorage,
  } = useProjectAssets(id);
  
  // Selection and playback state
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Particle settings with history for undo/redo
  const {
    state: settings,
    set: setSettings,
    undo,
    redo,
    reset: resetHistory,
    canUndo,
    canRedo,
  } = useHistory<ParticleSettings>(defaultSettings);

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !authLoading) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch project
  useEffect(() => {
    if (user && id) {
      fetchProject();
    }
  }, [user, id]);

  // Auto-select first asset
  useEffect(() => {
    if (assets.length > 0 && !selectedAssetId) {
      setSelectedAssetId(assets[0].id);
    }
  }, [assets, selectedAssetId]);

  // Playback timer with loop support
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 0.016; // ~60fps
        if (next >= settings.duration) {
          return settings.loop ? 0 : settings.duration;
        }
        return next;
      });
    }, 16);
    
    return () => clearInterval(interval);
  }, [isPlaying, settings.duration, settings.loop]);

  const fetchProject = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      toast({
        title: 'Project not found',
        description: 'This project does not exist or you do not have access.',
        variant: 'destructive',
      });
      navigate('/dashboard');
    } else {
      setProject(data);
      setProjectName(data.name);
    }
    
    setLoading(false);
  };

  const handleSave = async () => {
    if (!project) return;
    
    setSaving(true);
    
    const { error } = await supabase
      .from('projects')
      .update({ name: projectName })
      .eq('id', project.id);
    
    if (error) {
      toast({
        title: 'Error saving',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Saved!',
        description: 'Project updated successfully.',
      });
    }
    
    setSaving(false);
  };

  const handleUpload = useCallback(async (files: File[]) => {
    if (!user) return;
    await uploadMultipleAssets(files, user.id);
  }, [user, uploadMultipleAssets]);

  const handleAssetSelect = useCallback((assetId: string) => {
    setSelectedAssetId(assetId);
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  }, []);

  const handleReorderAssets = useCallback((newOrder: typeof assets) => {
    reorderAssets(newOrder);
  }, [reorderAssets]);

  const handleUploadBackgroundImage = useCallback(async (files: File[]): Promise<string | undefined> => {
    if (!user || files.length === 0) return undefined;
    const url = await uploadToStorage(files[0], user.id);
    return url ?? undefined;
  }, [user, uploadToStorage]);

  const handleSettingsChange = useCallback((newSettings: Partial<ParticleSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, [setSettings]);

  const handleResetSettings = useCallback(() => {
    resetHistory(defaultSettings);
    toast({
      title: 'Settings reset',
      description: 'All settings restored to defaults.',
    });
  }, [resetHistory, toast]);

  const handleLoadTemplate = useCallback((templateSettings: ParticleSettings) => {
    setSettings(templateSettings);
  }, [setSettings]);

  // Keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    {
      key: ' ',
      action: () => setIsPlaying(prev => !prev),
      description: 'Play/Pause',
    },
    {
      key: 'z',
      ctrl: true,
      action: undo,
      description: 'Undo',
    },
    {
      key: 'z',
      ctrl: true,
      shift: true,
      action: redo,
      description: 'Redo',
    },
    {
      key: 's',
      ctrl: true,
      action: handleSave,
      description: 'Save',
    },
    {
      key: 'r',
      ctrl: true,
      action: handleResetSettings,
      description: 'Reset',
    },
    {
      key: '[',
      action: () => setCurrentTime(0),
      description: 'Skip to start',
    },
    {
      key: ']',
      action: () => setCurrentTime(settings.duration),
      description: 'Skip to end',
    },
  ];

  useKeyboardShortcuts(shortcuts);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm flex-shrink-0 z-50">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="h-7 w-40 bg-transparent border-none text-sm font-medium focus-visible:ring-0 focus-visible:ring-offset-0 px-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Undo/Redo buttons */}
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (⌘Z)"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (⌘⇧Z)"
            >
              <Redo2 className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border/50 mx-1" />

            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            >
              {leftPanelOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
            >
              {rightPanelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
            </Button>
            
            <div className="w-px h-6 bg-border/50 mx-1" />

            {/* Template Manager */}
            <TemplateManager 
              currentSettings={settings} 
              onLoadTemplate={handleLoadTemplate}
              onCaptureSnapshot={async () => canvasRef.current?.captureSnapshot() ?? null}
            />
            
            <div className="w-px h-6 bg-border/50 mx-1" />
            
            {/* Keyboard shortcuts help */}
            <KeyboardShortcutsHelp />
            
            <Button 
              variant="outline" 
              size="sm"
              className="h-8"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1.5" />
              )}
              Save
            </Button>
            
            <VideoExport
              canvasRef={canvasRef}
              duration={settings.duration}
              fps={settings.fps}
              projectName={projectName}
            />
            
            <CodeExport
              settings={settings}
              assets={assets}
              projectName={projectName}
            />
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left sidebar - Assets */}
        {leftPanelOpen && (
          <aside className="w-full lg:w-56 xl:w-64 border-b lg:border-b-0 lg:border-r border-border/50 bg-card/30 p-3 lg:p-4 flex-shrink-0 flex flex-col max-h-[30vh] lg:max-h-none">
            <h3 className="text-xs lg:text-sm font-medium mb-2 lg:mb-4">Assets</h3>
            <div className="flex-1 min-h-0 overflow-auto">
              <AssetGallery
                assets={assets}
                loading={assetsLoading}
                uploading={uploading}
                selectedAssets={selectedAssets}
                onUpload={handleUpload}
                onSelect={handleAssetSelect}
                onDelete={deleteAsset}
                onReorder={handleReorderAssets}
              />
            </div>
          </aside>
        )}

        {/* Canvas area */}
        <main className="flex-1 flex items-center justify-center bg-muted/10 p-2 sm:p-4 min-w-0 min-h-0">
          <div className="w-full h-full max-w-5xl max-h-[50vh] sm:max-h-[60vh] lg:max-h-[70vh] rounded-xl overflow-hidden border border-border/50 shadow-xl">
            {assets.length > 0 ? (
              <ParticleCanvas
                ref={canvasRef}
                assets={assets}
                currentTime={currentTime}
                duration={settings.duration}
                particleCount={settings.particleCount}
                particleSize={settings.particleSize}
                transitionStyle={settings.transitionStyle}
                isPlaying={isPlaying}
                backgroundColor={settings.backgroundColor}
                backgroundType={settings.backgroundType}
                backgroundGradient={settings.backgroundGradient}
                backgroundImage={settings.backgroundImage}
                backgroundOpacity={settings.backgroundOpacity}
                backgroundBlur={settings.backgroundBlur}
                autoRotate={settings.autoRotate}
                depthEnabled={settings.depthEnabled}
                colorContrast={settings.colorContrast}
                colorSaturation={settings.colorSaturation}
                colorBrightness={settings.colorBrightness}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-card/50">
                <div className="text-center px-4">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-pulse-glow">
                    <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Upload images to begin</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
                    Add images from the panel to create your particle animation
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right sidebar - Controls */}
        {rightPanelOpen && (
          <aside className="w-full lg:w-64 xl:w-72 border-t lg:border-t-0 lg:border-l border-border/50 bg-card/30 p-3 lg:p-4 flex-shrink-0 overflow-y-auto max-h-[30vh] lg:max-h-none">
            <h3 className="text-xs lg:text-sm font-medium mb-2 lg:mb-4">Settings</h3>
            <ParticleControls
              settings={settings}
              onSettingsChange={handleSettingsChange}
              onReset={handleResetSettings}
              onUploadBackgroundImage={handleUploadBackgroundImage}
            />
          </aside>
        )}
      </div>

      {/* Bottom timeline */}
      <div className="h-24 sm:h-28 lg:h-32 border-t border-border/50 bg-card/50 px-2 sm:px-4 py-2 sm:py-3 flex-shrink-0">
        <Timeline
          assets={assets}
          duration={settings.duration}
          currentTime={currentTime}
          isPlaying={isPlaying}
          onTimeChange={setCurrentTime}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onAssetSelect={(id) => setSelectedAssetId(id)}
          selectedAssetId={selectedAssetId}
          onReorderAssets={handleReorderAssets}
        />
      </div>
    </div>
  );
}
