import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Bookmark, Save, Download, Trash2, Globe, Lock, Loader2, FolderOpen, ChevronDown } from 'lucide-react';
import { ParticleSettings } from './ParticleControls';
import { Json } from '@/integrations/supabase/types';

interface Template {
  id: string;
  name: string;
  description: string | null;
  settings: ParticleSettings;
  is_public: boolean;
  created_at: string;
  user_id: string;
}

interface TemplateManagerProps {
  currentSettings: ParticleSettings;
  onLoadTemplate: (settings: ParticleSettings) => void;
}

export function TemplateManager({ currentSettings, onLoadTemplate }: TemplateManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [publicTemplates, setPublicTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    isPublic: false,
  });

  const fetchTemplates = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch user's templates
      const { data: userTemplates, error: userError } = await supabase
        .from('animation_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (userError) throw userError;

      // Fetch public templates (excluding user's own)
      const { data: pubTemplates, error: pubError } = await supabase
        .from('animation_templates')
        .select('*')
        .eq('is_public', true)
        .neq('user_id', user.id)
        .order('likes_count', { ascending: false })
        .limit(20);

      if (pubError) throw pubError;

      setTemplates((userTemplates || []).map(t => ({
        ...t,
        settings: t.settings as unknown as ParticleSettings,
      })));
      setPublicTemplates((pubTemplates || []).map(t => ({
        ...t,
        settings: t.settings as unknown as ParticleSettings,
      })));
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user, fetchTemplates]);

  const handleSaveTemplate = async () => {
    if (!user || !newTemplate.name.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('animation_templates')
        .insert({
          user_id: user.id,
          name: newTemplate.name.trim(),
          description: newTemplate.description.trim() || null,
          settings: currentSettings as unknown as Json,
          is_public: newTemplate.isPublic,
        });

      if (error) throw error;

      toast({
        title: 'Template saved',
        description: `"${newTemplate.name}" has been saved.`,
      });

      setNewTemplate({ name: '', description: '', isPublic: false });
      setSaveDialogOpen(false);
      fetchTemplates();
    } catch (error: any) {
      toast({
        title: 'Error saving template',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLoadTemplate = (template: Template) => {
    onLoadTemplate(template.settings);
    setLoadDialogOpen(false);
    toast({
      title: 'Template loaded',
      description: `"${template.name}" settings applied.`,
    });
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('animation_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: 'Template deleted',
      });
      fetchTemplates();
    } catch (error: any) {
      toast({
        title: 'Error deleting template',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleTogglePublic = async (template: Template) => {
    try {
      const { error } = await supabase
        .from('animation_templates')
        .update({ is_public: !template.is_public })
        .eq('id', template.id);

      if (error) throw error;

      toast({
        title: template.is_public ? 'Template is now private' : 'Template is now public',
      });
      fetchTemplates();
    } catch (error: any) {
      toast({
        title: 'Error updating template',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-1">
      {/* Save Template Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <Save className="h-3.5 w-3.5" />
            Save Template
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save your current settings as a reusable template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="My awesome animation"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="A beautiful particle effect with..."
                value={newTemplate.description}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Share publicly</Label>
                <p className="text-xs text-muted-foreground">
                  Allow others to use this template
                </p>
              </div>
              <Switch
                checked={newTemplate.isPublic}
                onCheckedChange={(checked) => setNewTemplate(prev => ({ ...prev, isPublic: checked }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={saving || !newTemplate.name.trim()}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Template Dialog */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <FolderOpen className="h-3.5 w-3.5" />
            Load
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Load Template</DialogTitle>
            <DialogDescription>
              Choose a template to apply its settings.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* User's Templates */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Bookmark className="h-4 w-4" />
                    My Templates
                  </h4>
                  {templates.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No saved templates yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0 mr-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">{template.name}</span>
                              {template.is_public ? (
                                <Globe className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              ) : (
                                <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              )}
                            </div>
                            {template.description && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {template.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLoadTemplate(template)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleTogglePublic(template)}>
                                  {template.is_public ? (
                                    <>
                                      <Lock className="h-4 w-4 mr-2" />
                                      Make Private
                                    </>
                                  ) : (
                                    <>
                                      <Globe className="h-4 w-4 mr-2" />
                                      Make Public
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteTemplate(template.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Public Templates */}
                {publicTemplates.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Community Templates
                    </h4>
                    <div className="space-y-2">
                      {publicTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={() => handleLoadTemplate(template)}
                        >
                          <div className="flex-1 min-w-0 mr-3">
                            <span className="font-medium text-sm truncate block">{template.name}</span>
                            {template.description && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {template.description}
                              </p>
                            )}
                          </div>
                          <Download className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
