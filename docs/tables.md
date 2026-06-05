create table bounty.avatars (
  id text not null,
  display_name text not null,
  unlock_level integer not null default 1,
  constraint avatars_pkey primary key (id)
) TABLESPACE pg_default;

create table bounty.budgets (
  user_id uuid not null,
  weekly_limit bigint null,
  share_blowout boolean not null default false,
  updated_at timestamp with time zone not null default now(),
  constraint budgets_pkey primary key (user_id),
  constraint budgets_user_id_fkey foreign KEY (user_id) references bounty.profiles (id) on delete CASCADE,
  constraint budgets_weekly_limit_check check (
    (
      (weekly_limit is null)
      or (weekly_limit >= 0)
    )
  )
) TABLESPACE pg_default;

create table bounty.expenses (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  amount bigint not null,
  category bounty.expense_category not null,
  note text null,
  is_recurring boolean not null default false,
  recurring_id uuid null,
  client_uuid uuid null,
  spent_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  constraint expenses_pkey primary key (id),
  constraint expenses_user_id_client_uuid_key unique (user_id, client_uuid),
  constraint expenses_recurring_id_fkey foreign KEY (recurring_id) references bounty.recurring_expenses (id) on delete set null,
  constraint expenses_user_id_fkey foreign KEY (user_id) references bounty.profiles (id) on delete CASCADE,
  constraint expenses_amount_check check ((amount > 0)),
  constraint expenses_note_check check (
    (
      (note is null)
      or (char_length(note) <= 140)
    )
  )
) TABLESPACE pg_default;

create index IF not exists expenses_user_spent_idx on bounty.expenses using btree (user_id, spent_at desc) TABLESPACE pg_default;

create index IF not exists expenses_user_cat_idx on bounty.expenses using btree (user_id, category) TABLESPACE pg_default
where
  (is_recurring = false);

create trigger trg_expense_delete BEFORE DELETE on bounty.expenses for EACH row
execute FUNCTION bounty.on_expense_delete ();

create trigger trg_expense_insert
after INSERT on bounty.expenses for EACH row
execute FUNCTION bounty.on_expense_insert ();

create trigger trg_expense_update
after
update on bounty.expenses for EACH row
execute FUNCTION bounty.on_expense_update ();

create table bounty.friendships (
  id uuid not null default gen_random_uuid (),
  requester_id uuid not null,
  addressee_id uuid not null,
  status bounty.friendship_status not null default 'pending'::bounty.friendship_status,
  created_at timestamp with time zone not null default now(),
  responded_at timestamp with time zone null,
  constraint friendships_pkey primary key (id),
  constraint friendships_addressee_id_fkey foreign KEY (addressee_id) references bounty.profiles (id) on delete CASCADE,
  constraint friendships_requester_id_fkey foreign KEY (requester_id) references bounty.profiles (id) on delete CASCADE,
  constraint friendships_check check ((requester_id <> addressee_id))
) TABLESPACE pg_default;

create unique INDEX IF not exists friendships_pair_uidx on bounty.friendships using btree (
  LEAST(requester_id, addressee_id),
  GREATEST(requester_id, addressee_id)
) TABLESPACE pg_default;

create index IF not exists friendships_addr_idx on bounty.friendships using btree (addressee_id) TABLESPACE pg_default
where
  (status = 'pending'::bounty.friendship_status);

create trigger friendships
after INSERT on bounty.friendships for EACH row
execute FUNCTION supabase_functions.http_request (
  'https://utyexcfnophlxabpzbfy.supabase.co/functions/v1/push-fanout',
  'POST',
  '{"Content-type":"application/json","x-webhook-secret":"bountyapp"}',
  '{}',
  '5000'
);

create trigger trg_reciprocal_friend BEFORE INSERT on bounty.friendships for EACH row
execute FUNCTION bounty.handle_reciprocal_friend_request ();

create table bounty.group_invites (
  id uuid not null default gen_random_uuid (),
  group_id uuid not null,
  code text not null,
  created_by uuid not null,
  max_uses integer null,
  uses integer not null default 0,
  expires_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  constraint group_invites_pkey primary key (id),
  constraint group_invites_code_key unique (code),
  constraint group_invites_created_by_fkey foreign KEY (created_by) references bounty.profiles (id) on delete CASCADE,
  constraint group_invites_group_id_fkey foreign KEY (group_id) references bounty.groups (id) on delete CASCADE,
  constraint group_invites_max_uses_check check (
    (
      (max_uses is null)
      or (max_uses > 0)
    )
  )
) TABLESPACE pg_default;

create table bounty.group_listened_categories (
  group_id uuid not null,
  category bounty.expense_category not null,
  constraint group_listened_categories_pkey primary key (group_id, category),
  constraint group_listened_categories_group_id_fkey foreign KEY (group_id) references bounty.groups (id) on delete CASCADE
) TABLESPACE pg_default;

create table bounty.group_members (
  group_id uuid not null,
  user_id uuid not null,
  role bounty.member_role not null default 'member'::bounty.member_role,
  joined_at timestamp with time zone not null default now(),
  constraint group_members_pkey primary key (group_id, user_id),
  constraint group_members_group_id_fkey foreign KEY (group_id) references bounty.groups (id) on delete CASCADE,
  constraint group_members_user_id_fkey foreign KEY (user_id) references bounty.profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists gm_user_idx on bounty.group_members using btree (user_id) TABLESPACE pg_default;

create table bounty.group_messages (
  id uuid not null default gen_random_uuid (),
  group_id uuid not null,
  type bounty.message_type not null,
  sender_id uuid null,
  expense_id uuid null,
  category bounty.expense_category null,
  amount bigint null,
  note text null,
  body text null,
  created_at timestamp with time zone not null default now(),
  constraint group_messages_pkey primary key (id),
  constraint group_messages_expense_id_fkey foreign KEY (expense_id) references bounty.expenses (id) on delete set null,
  constraint group_messages_group_id_fkey foreign KEY (group_id) references bounty.groups (id) on delete CASCADE,
  constraint group_messages_sender_id_fkey foreign KEY (sender_id) references bounty.profiles (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists msgs_group_created_idx on bounty.group_messages using btree (group_id, created_at desc) TABLESPACE pg_default;

create index IF not exists idx_group_messages_expense on bounty.group_messages using btree (expense_id) TABLESPACE pg_default
where
  (type = 'bounty_card'::bounty.message_type);

create trigger group_messages
after INSERT on bounty.group_messages for EACH row
execute FUNCTION supabase_functions.http_request (
  'https://utyexcfnophlxabpzbfy.supabase.co/functions/v1/push-fanout',
  'POST',
  '{"Content-type":"application/json","x-webhook-secret":"bountyapp"}',
  '{}',
  '5000'
);

create table bounty.groups (
  id uuid not null default gen_random_uuid (),
  name text not null,
  owner_id uuid not null,
  kind bounty.group_kind not null,
  status bounty.group_status not null default 'active'::bounty.group_status,
  expires_at timestamp with time zone null,
  final_leaderboard jsonb null,
  locked_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  constraint groups_pkey primary key (id),
  constraint groups_owner_id_fkey foreign KEY (owner_id) references bounty.profiles (id) on delete CASCADE,
  constraint groups_check check (
    (
      (
        (kind = 'temporal'::bounty.group_kind)
        and (expires_at is not null)
      )
      or (
        (kind = 'permanent'::bounty.group_kind)
        and (expires_at is null)
      )
    )
  ),
  constraint groups_name_check check (
    (
      (char_length(name) >= 1)
      and (char_length(name) <= 40)
    )
  )
) TABLESPACE pg_default;

create index IF not exists groups_expiry_idx on bounty.groups using btree (expires_at) TABLESPACE pg_default
where
  (
    (status = 'active'::bounty.group_status)
    and (kind = 'temporal'::bounty.group_kind)
  );

  create table bounty.notification_settings (
  user_id uuid not null,
  on_reaction boolean not null default true,
  on_bounty_card boolean not null default true,
  on_friend_request boolean not null default true,
  on_budget_alert boolean not null default true,
  on_group_lock boolean not null default true,
  on_streak_reminder boolean not null default true,
  constraint notification_settings_pkey primary key (user_id),
  constraint notification_settings_user_id_fkey foreign KEY (user_id) references bounty.profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create table bounty.profiles (
  id uuid not null,
  username text not null,
  display_name text not null,
  avatar_id text not null default 'rookie_fox'::text,
  timezone text not null default 'Asia/Jakarta'::text,
  xp integer not null default 0,
  level integer not null default 1,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_log_date date null,
  created_at timestamp with time zone not null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_username_key unique (username),
  constraint profiles_avatar_id_fkey foreign KEY (avatar_id) references bounty.avatars (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint profiles_level_check check ((level >= 1)),
  constraint profiles_username_check check ((username ~ '^[a-z0-9_]{3,20}$'::text)),
  constraint profiles_display_name_check check (
    (
      (char_length(display_name) >= 1)
      and (char_length(display_name) <= 30)
    )
  ),
  constraint profiles_xp_check check ((xp >= 0))
) TABLESPACE pg_default;

create trigger trg_lock_username BEFORE
update on bounty.profiles for EACH row
execute FUNCTION bounty.prevent_username_change ();

create trigger trg_profile_insert
after INSERT on bounty.profiles for EACH row
execute FUNCTION bounty.on_profile_insert ();

create table bounty.push_tokens (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  token text not null,
  platform text not null,
  created_at timestamp with time zone not null default now(),
  constraint push_tokens_pkey primary key (id),
  constraint push_tokens_user_id_token_key unique (user_id, token),
  constraint push_tokens_user_token_key unique (user_id, token),
  constraint push_tokens_user_id_fkey foreign KEY (user_id) references bounty.profiles (id) on delete CASCADE,
  constraint push_tokens_platform_check check (
    (
      platform = any (array['web'::text, 'android'::text, 'ios'::text])
    )
  )
) TABLESPACE pg_default;

create table bounty.reactions (
  id uuid not null default gen_random_uuid (),
  message_id uuid not null,
  user_id uuid not null,
  type bounty.reaction_type not null,
  created_at timestamp with time zone not null default now(),
  constraint reactions_pkey primary key (id),
  constraint reactions_message_id_user_id_type_key unique (message_id, user_id, type),
  constraint reactions_message_id_fkey foreign KEY (message_id) references bounty.group_messages (id) on delete CASCADE,
  constraint reactions_user_id_fkey foreign KEY (user_id) references bounty.profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists reactions_message_idx on bounty.reactions using btree (message_id) TABLESPACE pg_default;

create trigger reactions
after INSERT on bounty.reactions for EACH row
execute FUNCTION supabase_functions.http_request (
  'https://utyexcfnophlxabpzbfy.supabase.co/functions/v1/push-fanout',
  'POST',
  '{"Content-type":"application/json","x-webhook-secret":"bountyapp"}',
  '{}',
  '5000'
);


```sql
create table bounty.recurring_expenses (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  amount bigint not null,
  category bounty.expense_category not null,
  note text null,
  cadence bounty.recurrence not null,
  next_occurrence date not null,
  active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  constraint recurring_expenses_pkey primary key (id),
  constraint recurring_expenses_user_id_fkey foreign KEY (user_id) references bounty.profiles (id) on delete CASCADE,
  constraint recurring_expenses_amount_check check ((amount > 0))
) TABLESPACE pg_default;
```

```sql
create index IF not exists recurring_next_idx on bounty.recurring_expenses using btree (next_occurrence) TABLESPACE pg_default
where
  active;

  create table bounty.trophies (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  group_id uuid null,
  group_name text not null,
  title text not null,
  emoji text not null default '🏆'::text,
  awarded_at timestamp with time zone not null default now(),
  constraint trophies_pkey primary key (id),
  constraint trophies_group_id_fkey foreign KEY (group_id) references bounty.groups (id) on delete set null,
  constraint trophies_user_id_fkey foreign KEY (user_id) references bounty.profiles (id) on delete CASCADE
) TABLESPACE pg_default;
```