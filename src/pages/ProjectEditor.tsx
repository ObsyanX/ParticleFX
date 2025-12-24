import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Loader2, 
  Sparkles, 
  Upload,
  Play,
  Settings,
  Download,
  Save
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
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projectName, setProjectName] = useState('');

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="h-8 w-48 bg-transparent border-none text-base font-medium focus-visible:ring-0 focus-visible:ring-offset-0 px-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex">
        {/* Left sidebar - Assets */}
        <aside className="w-64 border-r border-border/50 bg-card/30 p-4 hidden lg:block">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Assets</h3>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center">
            <Upload className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Drop images here
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              or click to upload
            </p>
          </div>
        </aside>

        {/* Canvas area */}
        <main className="flex-1 flex items-center justify-center bg-muted/20 p-8">
          <div className="aspect-video w-full max-w-4xl rounded-2xl bg-card/50 border border-border/50 overflow-hidden shadow-xl">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Upload images to begin</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add at least one image to create your particle animation
                </p>
                <Button className="bg-primary text-primary-foreground">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Images
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Right sidebar - Controls */}
        <aside className="w-72 border-l border-border/50 bg-card/30 p-4 hidden xl:block">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Particle Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Count</label>
                  <Input type="number" defaultValue="50000" className="h-8 mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Size</label>
                  <Input type="number" defaultValue="2" step="0.1" className="h-8 mt-1" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Transition</h3>
              <div className="grid grid-cols-2 gap-2">
                {['Morph', 'Explode', 'Swirl', 'Wave'].map((style) => (
                  <Button 
                    key={style} 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                  >
                    {style}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Timeline</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Duration (seconds)</label>
                  <Input type="number" defaultValue="10" className="h-8 mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">FPS</label>
                  <Input type="number" defaultValue="60" className="h-8 mt-1" />
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom timeline */}
      <div className="h-24 border-t border-border/50 bg-card/50 px-4 py-3">
        <div className="flex items-center gap-4 h-full">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Play className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 h-12 bg-muted/50 rounded-lg border border-border/50">
            {/* Timeline will go here */}
          </div>
          
          <div className="text-sm text-muted-foreground">
            0:00 / 0:10
          </div>
        </div>
      </div>
    </div>
  );
}
