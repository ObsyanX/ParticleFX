import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useProjectAssets } from '@/hooks/useProjectAssets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AssetGallery } from '@/components/editor/AssetGallery';
import { ParticleCanvas, ParticleCanvasHandle } from '@/components/editor/ParticleCanvas';
import { ParticleControls, ParticleSettings, defaultSettings } from '@/components/editor/ParticleControls';
import { Timeline } from '@/components/editor/Timeline';
import { VideoExport } from '@/components/editor/VideoExport';
import { CodeExport } from '@/components/editor/CodeExport';
import {
  ArrowLeft, 
  Loader2, 
  Sparkles, 
  Save,
  PanelLeftClose,
  PanelRightClose,
  PanelLeft,
  PanelRight
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
    deleteAsset 
  } = useProjectAssets(id);
  
  // Selection and playback state
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Particle settings
  const [settings, setSettings] = useState<ParticleSettings>(defaultSettings);

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

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 0.016; // ~60fps
        return next >= settings.duration ? 0 : next;
      });
    }, 16);
    
    return () => clearInterval(interval);
  }, [isPlaying, settings.duration]);

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

  const handleSettingsChange = useCallback((newSettings: Partial<ParticleSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const handleResetSettings = useCallback(() => {
    setSettings(defaultSettings);
    toast({
      title: 'Settings reset',
      description: 'All settings restored to defaults.',
    });
  }, [toast]);

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
      <div className="flex-1 flex min-h-0">
        {/* Left sidebar - Assets */}
        {leftPanelOpen && (
          <aside className="w-64 border-r border-border/50 bg-card/30 p-4 flex-shrink-0 flex flex-col">
            <h3 className="text-sm font-medium mb-4">Assets</h3>
            <div className="flex-1 min-h-0">
              <AssetGallery
                assets={assets}
                loading={assetsLoading}
                uploading={uploading}
                selectedAssets={selectedAssets}
                onUpload={handleUpload}
                onSelect={handleAssetSelect}
                onDelete={deleteAsset}
              />
            </div>
          </aside>
        )}

        {/* Canvas area */}
        <main className="flex-1 flex items-center justify-center bg-muted/10 p-4 min-w-0">
          <div className="w-full h-full max-w-5xl max-h-[70vh] rounded-xl overflow-hidden border border-border/50 shadow-xl">
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
                autoRotate={settings.autoRotate}
                depthEnabled={settings.depthEnabled}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-card/50">
                <div className="text-center">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Upload images to begin</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Add images from the left panel to create your particle animation
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right sidebar - Controls */}
        {rightPanelOpen && (
          <aside className="w-72 border-l border-border/50 bg-card/30 p-4 flex-shrink-0 overflow-y-auto">
            <h3 className="text-sm font-medium mb-4">Settings</h3>
            <ParticleControls
              settings={settings}
              onSettingsChange={handleSettingsChange}
              onReset={handleResetSettings}
            />
          </aside>
        )}
      </div>

      {/* Bottom timeline */}
      <div className="h-28 border-t border-border/50 bg-card/50 px-4 py-3 flex-shrink-0">
        <Timeline
          assets={assets}
          duration={settings.duration}
          currentTime={currentTime}
          isPlaying={isPlaying}
          onTimeChange={setCurrentTime}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onAssetSelect={(id) => setSelectedAssetId(id)}
          selectedAssetId={selectedAssetId}
        />
      </div>
    </div>
  );
}
