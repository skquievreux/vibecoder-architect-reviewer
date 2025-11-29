-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Repositories Table
create table if not exists repositories (
  id uuid primary key default uuid_generate_v4(),
  github_id bigint unique not null,
  name text not null,
  full_name text not null,
  html_url text not null,
  description text,
  is_private boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_pushed_at timestamptz,
  language text,
  default_branch text
);

-- Technologies Table (Languages, Frameworks, Tools)
create table if not exists technologies (
  id uuid primary key default uuid_generate_v4(),
  repository_id uuid references repositories(id) on delete cascade,
  name text not null,
  category text check (category in ('language', 'framework', 'library', 'tool', 'database', 'hosting')),
  version text,
  detected_at timestamptz default now()
);

-- Interfaces Table (APIs, Integrations)
create table if not exists interfaces (
  id uuid primary key default uuid_generate_v4(),
  repository_id uuid references repositories(id) on delete cascade,
  type text check (type in ('rest_api', 'graphql', 'grpc', 'database_connection', 'external_service')),
  direction text check (direction in ('inbound', 'outbound')),
  details jsonb, -- Stores details like URL, port, schema path
  detected_at timestamptz default now()
);

-- Health & Maintenance Table
create table if not exists repo_health (
  id uuid primary key default uuid_generate_v4(),
  repository_id uuid references repositories(id) on delete cascade,
  outdated_dependencies_count int default 0,
  vulnerabilities_count int default 0,
  last_checked_at timestamptz default now(),
  health_score int -- 0 to 100
);

-- Cost & Usage Snapshots (for Supabase or general hosting)
create table if not exists cost_snapshots (
  id uuid primary key default uuid_generate_v4(),
  date date default current_date,
  total_monthly_cost_est decimal(10, 2),
  supabase_cost_est decimal(10, 2),
  details jsonb -- Breakdown by project
);
