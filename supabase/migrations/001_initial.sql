-- CaseWorks initial schema
-- HM Treasury Five Case Model business case platform

-- Enable RLS everywhere
-- Run in Supabase SQL editor

-- Profiles (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  organisation text,
  role text,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Business cases
create table if not exists business_cases (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  project_reference text,
  current_stage text default 'SOC' check (current_stage in ('SOC', 'OBC', 'FBC')),
  department text,
  sro_name text,
  senior_finance_name text,
  total_value_band text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table business_cases enable row level security;
create policy "Owners can CRUD their cases" on business_cases for all using (auth.uid() = owner_id);

-- Case collaborators
create table if not exists case_collaborators (
  case_id uuid references business_cases(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  permission text check (permission in ('owner', 'editor', 'reviewer')) default 'editor',
  primary key (case_id, user_id)
);
alter table case_collaborators enable row level security;
create policy "Collaborators can view their collaboration rows" on case_collaborators for select using (auth.uid() = user_id);

-- Case sections
create table if not exists case_sections (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references business_cases(id) on delete cascade not null,
  stage text check (stage in ('SOC', 'OBC', 'FBC')) not null,
  case_type text check (case_type in ('strategic', 'economic', 'commercial', 'financial', 'management')) not null,
  section_key text not null,
  content_json jsonb default '{}',
  status text default 'not_started' check (status in ('not_started', 'drafting', 'review', 'complete')),
  word_count int default 0,
  last_edited_by uuid references profiles(id),
  last_edited_at timestamptz default now(),
  unique (case_id, stage, case_type, section_key)
);
alter table case_sections enable row level security;
create policy "Case owners/editors can manage sections" on case_sections for all
  using (
    exists (
      select 1 from business_cases where id = case_id and owner_id = auth.uid()
    )
    or
    exists (
      select 1 from case_collaborators where case_id = case_sections.case_id and user_id = auth.uid()
    )
  );

-- AI interactions
create table if not exists ai_interactions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references business_cases(id) on delete cascade not null,
  section_id uuid references case_sections(id) on delete set null,
  type text check (type in ('draft', 'critique', 'research', 'gap_analysis')) not null,
  prompt text,
  response text,
  accepted boolean default false,
  created_at timestamptz default now()
);
alter table ai_interactions enable row level security;
create policy "Case owners can see AI interactions" on ai_interactions for all
  using (exists (select 1 from business_cases where id = case_id and owner_id = auth.uid()));

-- Options register
create table if not exists options_register (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references business_cases(id) on delete cascade not null,
  option_name text not null,
  scope text,
  service_solution text,
  service_delivery text,
  implementation text,
  funding text,
  status text check (status in ('longlist', 'shortlist', 'preferred', 'discounted')) default 'longlist',
  rationale text,
  created_at timestamptz default now()
);
alter table options_register enable row level security;
create policy "Case owners can manage options" on options_register for all
  using (exists (select 1 from business_cases where id = case_id and owner_id = auth.uid()));

-- Risks register
create table if not exists risks_register (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references business_cases(id) on delete cascade not null,
  risk_description text not null,
  category text,
  likelihood int check (likelihood between 1 and 5) default 3,
  impact int check (impact between 1 and 5) default 3,
  mitigation text,
  owner text,
  allocation text check (allocation in ('authority', 'supplier', 'shared')) default 'authority',
  created_at timestamptz default now()
);
alter table risks_register enable row level security;
create policy "Case owners can manage risks" on risks_register for all
  using (exists (select 1 from business_cases where id = case_id and owner_id = auth.uid()));

-- Benefits register
create table if not exists benefits_register (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references business_cases(id) on delete cascade not null,
  benefit_description text not null,
  type text check (type in ('cashable', 'non-cashable')) default 'non-cashable',
  value numeric,
  realisation_date date,
  owner text,
  measurement_method text,
  created_at timestamptz default now()
);
alter table benefits_register enable row level security;
create policy "Case owners can manage benefits" on benefits_register for all
  using (exists (select 1 from business_cases where id = case_id and owner_id = auth.uid()));

-- Costs register
create table if not exists costs_register (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references business_cases(id) on delete cascade not null,
  cost_line text not null,
  year int,
  capital_revenue text check (capital_revenue in ('capital', 'revenue')) default 'capital',
  amount numeric,
  real_nominal text check (real_nominal in ('real', 'nominal')) default 'real',
  optimism_bias_pct numeric default 0,
  created_at timestamptz default now()
);
alter table costs_register enable row level security;
create policy "Case owners can manage costs" on costs_register for all
  using (exists (select 1 from business_cases where id = case_id and owner_id = auth.uid()));

-- Research artefacts
create table if not exists research_artefacts (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references business_cases(id) on delete cascade not null,
  title text not null,
  source_url text,
  content text,
  tags text[],
  attached_to_section_id uuid references case_sections(id) on delete set null,
  created_at timestamptz default now()
);
alter table research_artefacts enable row level security;
create policy "Case owners can manage research" on research_artefacts for all
  using (exists (select 1 from business_cases where id = case_id and owner_id = auth.uid()));

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_business_cases_updated_at
  before update on business_cases
  for each row execute procedure update_updated_at();
