# supabase table column layout

## query used

```sql
select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'bounty'
  and table_name in ('expenses','group_messages','groups','group_members','group_listened_categories','budgets')
order by table_name, ordinal_position;
```

## responses

```json
[
  {
    "table_name": "budgets",
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "budgets",
    "column_name": "weekly_limit",
    "data_type": "bigint",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "budgets",
    "column_name": "share_blowout",
    "data_type": "boolean",
    "is_nullable": "NO",
    "column_default": "false"
  },
  {
    "table_name": "budgets",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "expenses",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "expenses",
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "expenses",
    "column_name": "amount",
    "data_type": "bigint",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "expenses",
    "column_name": "category",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "expenses",
    "column_name": "note",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "expenses",
    "column_name": "is_recurring",
    "data_type": "boolean",
    "is_nullable": "NO",
    "column_default": "false"
  },
  {
    "table_name": "expenses",
    "column_name": "recurring_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "expenses",
    "column_name": "client_uuid",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "expenses",
    "column_name": "spent_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "expenses",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "group_listened_categories",
    "column_name": "group_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "group_listened_categories",
    "column_name": "category",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "group_members",
    "column_name": "group_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "group_members",
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "group_members",
    "column_name": "role",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": "'member'::bounty.member_role"
  },
  {
    "table_name": "group_members",
    "column_name": "joined_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "group_messages",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "group_messages",
    "column_name": "group_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "group_messages",
    "column_name": "type",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "group_messages",
    "column_name": "sender_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "group_messages",
    "column_name": "expense_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "group_messages",
    "column_name": "category",
    "data_type": "USER-DEFINED",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "group_messages",
    "column_name": "amount",
    "data_type": "bigint",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "group_messages",
    "column_name": "note",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "group_messages",
    "column_name": "body",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "group_messages",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "groups",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "groups",
    "column_name": "name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "groups",
    "column_name": "owner_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "groups",
    "column_name": "kind",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "groups",
    "column_name": "status",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": "'active'::bounty.group_status"
  },
  {
    "table_name": "groups",
    "column_name": "expires_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "groups",
    "column_name": "final_leaderboard",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "groups",
    "column_name": "locked_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "groups",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  }
]
```
