-- SYSTEMS TABLE
create table systems (
  name text primary key,
  category text
);

-- INTERFACES_WITH TABLE
create table interfaces_with (
  id uuid primary key default gen_random_uuid(),
  system_a_id text not null references systems(name) on delete cascade,
  system_b_id text not null references systems(name) on delete cascade,
  connection_type text not null,
  directional int default 1,
  unique (system_a_id, system_b_id)
);

-- PARENT-CHILD RELATIONSHIP TABLE (SELF-JOIN)
create table system_hierarchy (
  parent_id text not null references systems(name) on delete cascade,
  child_id text not null references systems(name) on delete cascade,
  unique (child_id)
);