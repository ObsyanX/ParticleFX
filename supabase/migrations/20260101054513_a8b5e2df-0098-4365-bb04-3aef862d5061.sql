-- Create animation_templates table
CREATE TABLE public.animation_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT false,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for user queries
CREATE INDEX idx_animation_templates_user_id ON public.animation_templates(user_id);
CREATE INDEX idx_animation_templates_public ON public.animation_templates(is_public) WHERE is_public = true;

-- Enable RLS
ALTER TABLE public.animation_templates ENABLE ROW LEVEL SECURITY;

-- Users can view their own templates
CREATE POLICY "Users can view own templates"
ON public.animation_templates
FOR SELECT
USING (auth.uid() = user_id);

-- Users can view public templates
CREATE POLICY "Anyone can view public templates"
ON public.animation_templates
FOR SELECT
USING (is_public = true);

-- Users can create their own templates
CREATE POLICY "Users can create own templates"
ON public.animation_templates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own templates
CREATE POLICY "Users can update own templates"
ON public.animation_templates
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own templates
CREATE POLICY "Users can delete own templates"
ON public.animation_templates
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_animation_templates_updated_at
BEFORE UPDATE ON public.animation_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();