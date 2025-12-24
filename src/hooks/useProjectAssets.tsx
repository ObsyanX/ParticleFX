import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

export type Asset = Tables<'assets'>;

export function useProjectAssets(projectId: string | undefined) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchAssets = useCallback(async () => {
    if (!projectId) return;
    
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('project_id', projectId)
      .eq('type', 'image')
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error('Error fetching assets:', error);
    } else {
      setAssets(data || []);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const uploadAsset = async (file: File, userId: string) => {
    if (!projectId) return null;
    
    setUploading(true);
    
    try {
      // Create file path: userId/projectId/filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${userId}/${projectId}/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('project-assets')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-assets')
        .getPublicUrl(filePath);
      
      // Get image dimensions
      const dimensions = await getImageDimensions(file);
      
      // Create asset record in database
      const { data: asset, error: dbError } = await supabase
        .from('assets')
        .insert({
          project_id: projectId,
          type: 'image',
          file_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          width: dimensions.width,
          height: dimensions.height,
          order_index: assets.length,
        })
        .select()
        .single();
      
      if (dbError) {
        throw dbError;
      }
      
      setAssets(prev => [...prev, asset]);
      
      toast({
        title: 'Image uploaded',
        description: file.name,
      });
      
      return asset;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      toast({
        title: 'Upload failed',
        description: message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultipleAssets = async (files: File[], userId: string) => {
    const results: Asset[] = [];
    
    for (const file of files) {
      const asset = await uploadAsset(file, userId);
      if (asset) {
        results.push(asset);
      }
    }
    
    return results;
  };

  const deleteAsset = async (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;
    
    try {
      // Extract file path from URL
      const url = new URL(asset.file_url);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-3).join('/'); // userId/projectId/filename
      
      // Delete from storage
      await supabase.storage
        .from('project-assets')
        .remove([filePath]);
      
      // Delete from database
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId);
      
      if (error) throw error;
      
      setAssets(prev => prev.filter(a => a.id !== assetId));
      
      toast({
        title: 'Image deleted',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Delete failed';
      toast({
        title: 'Delete failed',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const reorderAssets = async (newOrder: Asset[]) => {
    setAssets(newOrder);
    
    // Update order_index in database
    const updates = newOrder.map((asset, index) => 
      supabase
        .from('assets')
        .update({ order_index: index })
        .eq('id', asset.id)
    );
    
    await Promise.all(updates);
  };

  return {
    assets,
    loading,
    uploading,
    uploadAsset,
    uploadMultipleAssets,
    deleteAsset,
    reorderAssets,
    refetch: fetchAssets,
  };
}

// Helper to get image dimensions
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
    };
    img.src = URL.createObjectURL(file);
  });
}
