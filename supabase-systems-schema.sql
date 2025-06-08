-- SYSTEMS TABLE
create table systems (
  id uuid default gen_random_uuid(),
  name text primary key,
  category text
);
-- Create an index on the id column of the systems table
create index idx_systems_id on systems(id);

-- INTERFACES_WITH TABLE
create table interfaces_with (
  id uuid primary key default gen_random_uuid(),
  system_a_id text not null references systems(name) on delete cascade on update cascade,
  system_b_id text not null references systems(name) on delete cascade on update cascade,
  connection_type text not null,
  directional int default 1,
  unique (system_a_id, system_b_id)
);

-- PARENT-CHILD RELATIONSHIP TABLE (SELF-JOIN)
create table system_hierarchy (
  parent_id text not null references systems(name) on delete cascade on update cascade,
  child_id text not null references systems(name) on delete cascade on update cascade,
  unique (child_id)
);