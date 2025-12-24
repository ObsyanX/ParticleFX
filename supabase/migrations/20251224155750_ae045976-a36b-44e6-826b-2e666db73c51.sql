-- Create enums for type safety
CREATE TYPE public.project_status AS ENUM ('draft', 'rendering', 'completed', 'failed');
CREATE TYPE public.asset_type AS ENUM ('image', 'audio', 'frame', 'video', 'code');
CREATE TYPE public.layer_type AS ENUM ('image', 'particle', 'camera', 'effect');
CREATE TYPE public.worker_type AS ENUM ('cpu', 'gpu');
CREATE TYPE public.render_status AS ENUM ('queued', 'processing', 'completed', 'failed');
CREATE TYPE public.plan_type AS ENUM ('free', 'pro', 'studio', 'enterprise');
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'expired', 'past_due');
CREATE TYPE public.usage_action AS ENUM ('render', 'upload', 'export', 'preview');
CREATE TYPE public.export_language AS ENUM ('js', 'ts', 'react', 'html');
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  plan plan_type NOT NULL DEFAULT 'free',
  credits_remaining INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status project_status NOT NULL DEFAULT 'draft',
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Assets table (images, audio, etc.)
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type asset_type NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size BIGINT,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Timelines table
CREATE TABLE public.timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID UNIQUE NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  duration_seconds FLOAT NOT NULL DEFAULT 10,
  fps INTEGER NOT NULL DEFAULT 60,
  background_color TEXT NOT NULL DEFAULT '#000000',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Timeline layers
CREATE TABLE public.timeline_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timeline_id UUID NOT NULL REFERENCES public.timelines(id) ON DELETE CASCADE,
  layer_type layer_type NOT NULL,
  name TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Keyframes
CREATE TABLE public.keyframes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_id UUID NOT NULL REFERENCES public.timeline_layers(id) ON DELETE CASCADE,
  time_seconds FLOAT NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}',
  easing TEXT DEFAULT 'easeInOut',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Particle configs
CREATE TABLE public.particle_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID UNIQUE NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  particle_count INTEGER NOT NULL DEFAULT 50000,
  particle_size FLOAT NOT NULL DEFAULT 2.0,
  color_mode TEXT NOT NULL DEFAULT 'image',
  depth_enabled BOOLEAN NOT NULL DEFAULT false,
  transition_style TEXT NOT NULL DEFAULT 'morph',
  shader_config JSONB DEFAULT '{}',
  camera_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Render jobs
CREATE TABLE public.render_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status render_status NOT NULL DEFAULT 'queued',
  priority INTEGER NOT NULL DEFAULT 0,
  worker_type worker_type NOT NULL DEFAULT 'cpu',
  resolution TEXT NOT NULL DEFAULT '1920x1080',
  fps INTEGER NOT NULL DEFAULT 60,
  progress INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Render outputs
CREATE TABLE public.render_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  render_job_id UUID NOT NULL REFERENCES public.render_jobs(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  resolution TEXT NOT NULL,
  fps INTEGER NOT NULL,
  codec TEXT DEFAULT 'h264',
  file_size BIGINT,
  duration_seconds FLOAT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Code exports
CREATE TABLE public.code_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  language export_language NOT NULL,
  zip_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan plan_type NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  credits_monthly INTEGER NOT NULL DEFAULT 100,
  credits_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usage logs
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action usage_action NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 1,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_assets_project_id ON public.assets(project_id);
CREATE INDEX idx_assets_type ON public.assets(type);
CREATE INDEX idx_timeline_layers_timeline_id ON public.timeline_layers(timeline_id);
CREATE INDEX idx_keyframes_layer_id ON public.keyframes(layer_id);
CREATE INDEX idx_render_jobs_status ON public.render_jobs(status);
CREATE INDEX idx_render_jobs_user_id ON public.render_jobs(user_id);
CREATE INDEX idx_render_jobs_project_id ON public.render_jobs(project_id);
CREATE INDEX idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX idx_usage_logs_action ON public.usage_logs(action);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keyframes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.particle_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.render_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  INSERT INTO public.subscriptions (user_id, plan, status, credits_monthly)
  VALUES (NEW.id, 'free', 'active', 100);
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timelines_updated_at
  BEFORE UPDATE ON public.timelines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_particle_configs_updated_at
  BEFORE UPDATE ON public.particle_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_roles (read-only for users)
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for projects
CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for assets (through project ownership)
CREATE POLICY "Users can view assets of own projects"
  ON public.assets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = assets.project_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create assets in own projects"
  ON public.assets FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update assets in own projects"
  ON public.assets FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = assets.project_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete assets in own projects"
  ON public.assets FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = assets.project_id 
    AND projects.user_id = auth.uid()
  ));

-- RLS Policies for timelines
CREATE POLICY "Users can view timelines of own projects"
  ON public.timelines FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = timelines.project_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create timelines in own projects"
  ON public.timelines FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update timelines in own projects"
  ON public.timelines FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = timelines.project_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete timelines in own projects"
  ON public.timelines FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = timelines.project_id 
    AND projects.user_id = auth.uid()
  ));

-- RLS Policies for timeline_layers
CREATE POLICY "Users can view layers of own timelines"
  ON public.timeline_layers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.timelines 
    JOIN public.projects ON projects.id = timelines.project_id
    WHERE timelines.id = timeline_layers.timeline_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create layers in own timelines"
  ON public.timeline_layers FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.timelines 
    JOIN public.projects ON projects.id = timelines.project_id
    WHERE timelines.id = timeline_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update layers in own timelines"
  ON public.timeline_layers FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.timelines 
    JOIN public.projects ON projects.id = timelines.project_id
    WHERE timelines.id = timeline_layers.timeline_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete layers in own timelines"
  ON public.timeline_layers FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.timelines 
    JOIN public.projects ON projects.id = timelines.project_id
    WHERE timelines.id = timeline_layers.timeline_id 
    AND projects.user_id = auth.uid()
  ));

-- RLS Policies for keyframes
CREATE POLICY "Users can view keyframes of own layers"
  ON public.keyframes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.timeline_layers
    JOIN public.timelines ON timelines.id = timeline_layers.timeline_id
    JOIN public.projects ON projects.id = timelines.project_id
    WHERE timeline_layers.id = keyframes.layer_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create keyframes in own layers"
  ON public.keyframes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.timeline_layers
    JOIN public.timelines ON timelines.id = timeline_layers.timeline_id
    JOIN public.projects ON projects.id = timelines.project_id
    WHERE timeline_layers.id = layer_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update keyframes in own layers"
  ON public.keyframes FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.timeline_layers
    JOIN public.timelines ON timelines.id = timeline_layers.timeline_id
    JOIN public.projects ON projects.id = timelines.project_id
    WHERE timeline_layers.id = keyframes.layer_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete keyframes in own layers"
  ON public.keyframes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.timeline_layers
    JOIN public.timelines ON timelines.id = timeline_layers.timeline_id
    JOIN public.projects ON projects.id = timelines.project_id
    WHERE timeline_layers.id = keyframes.layer_id 
    AND projects.user_id = auth.uid()
  ));

-- RLS Policies for particle_configs
CREATE POLICY "Users can view particle configs of own projects"
  ON public.particle_configs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = particle_configs.project_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create particle configs in own projects"
  ON public.particle_configs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update particle configs in own projects"
  ON public.particle_configs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = particle_configs.project_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete particle configs in own projects"
  ON public.particle_configs FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = particle_configs.project_id 
    AND projects.user_id = auth.uid()
  ));

-- RLS Policies for render_jobs
CREATE POLICY "Users can view own render jobs"
  ON public.render_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own render jobs"
  ON public.render_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own render jobs"
  ON public.render_jobs FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for render_outputs
CREATE POLICY "Users can view outputs of own render jobs"
  ON public.render_outputs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.render_jobs 
    WHERE render_jobs.id = render_outputs.render_job_id 
    AND render_jobs.user_id = auth.uid()
  ));

-- RLS Policies for code_exports
CREATE POLICY "Users can view exports of own projects"
  ON public.code_exports FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = code_exports.project_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create exports for own projects"
  ON public.code_exports FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_id 
    AND projects.user_id = auth.uid()
  ));

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for usage_logs
CREATE POLICY "Users can view own usage logs"
  ON public.usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own usage logs"
  ON public.usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for project assets
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('project-assets', 'project-assets', true, 52428800);

-- Storage policies for project-assets bucket
CREATE POLICY "Users can view own project assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own project assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own project assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'project-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own project assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'project-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Public read access for project assets (needed for preview/sharing)
CREATE POLICY "Public can view project assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-assets');