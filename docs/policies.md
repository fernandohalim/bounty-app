# supabase rls policies log

## query used

```sql
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'bounty'
order by tablename, policyname;
```

## responses

```json
[
  {
    "tablename": "avatars",
    "policyname": "avatars_read",
    "cmd": "SELECT",
    "roles": "{authenticated}",
    "qual": "true",
    "with_check": null
  },
  {
    "tablename": "budgets",
    "policyname": "budgets_own",
    "cmd": "ALL",
    "roles": "{authenticated}",
    "qual": "(user_id = auth.uid())",
    "with_check": "(user_id = auth.uid())"
  },
  {
    "tablename": "expenses",
    "policyname": "expenses_own",
    "cmd": "ALL",
    "roles": "{authenticated}",
    "qual": "(user_id = auth.uid())",
    "with_check": "(user_id = auth.uid())"
  },
  {
    "tablename": "friendships",
    "policyname": "fr_delete",
    "cmd": "DELETE",
    "roles": "{authenticated}",
    "qual": "((requester_id = auth.uid()) OR (addressee_id = auth.uid()))",
    "with_check": null
  },
  {
    "tablename": "friendships",
    "policyname": "fr_insert",
    "cmd": "INSERT",
    "roles": "{authenticated}",
    "qual": null,
    "with_check": "(requester_id = auth.uid())"
  },
  {
    "tablename": "friendships",
    "policyname": "fr_select",
    "cmd": "SELECT",
    "roles": "{authenticated}",
    "qual": "((requester_id = auth.uid()) OR (addressee_id = auth.uid()))",
    "with_check": null
  },
  {
    "tablename": "friendships",
    "policyname": "fr_update",
    "cmd": "UPDATE",
    "roles": "{authenticated}",
    "qual": "(addressee_id = auth.uid())",
    "with_check": "(addressee_id = auth.uid())"
  },
  {
    "tablename": "group_invites",
    "policyname": "gi_insert",
    "cmd": "INSERT",
    "roles": "{authenticated}",
    "qual": null,
    "with_check": "(EXISTS ( SELECT 1\n   FROM bounty.groups g\n  WHERE ((g.id = group_invites.group_id) AND (g.owner_id = auth.uid()))))"
  },
  {
    "tablename": "group_invites",
    "policyname": "gi_select",
    "cmd": "SELECT",
    "roles": "{authenticated}",
    "qual": "bounty.is_group_member(group_id)",
    "with_check": null
  },
  {
    "tablename": "group_listened_categories",
    "policyname": "glc_select",
    "cmd": "SELECT",
    "roles": "{authenticated}",
    "qual": "bounty.is_group_member(group_id)",
    "with_check": null
  },
  {
    "tablename": "group_listened_categories",
    "policyname": "glc_write",
    "cmd": "ALL",
    "roles": "{authenticated}",
    "qual": "(EXISTS ( SELECT 1\n   FROM bounty.groups g\n  WHERE ((g.id = group_listened_categories.group_id) AND (g.owner_id = auth.uid()))))",
    "with_check": "(EXISTS ( SELECT 1\n   FROM bounty.groups g\n  WHERE ((g.id = group_listened_categories.group_id) AND (g.owner_id = auth.uid()))))"
  },
  {
    "tablename": "group_members",
    "policyname": "gm_delete",
    "cmd": "DELETE",
    "roles": "{authenticated}",
    "qual": "(user_id = auth.uid())",
    "with_check": null
  },
  {
    "tablename": "group_members",
    "policyname": "gm_select",
    "cmd": "SELECT",
    "roles": "{authenticated}",
    "qual": "bounty.is_group_member(group_id)",
    "with_check": null
  },
  {
    "tablename": "group_members",
    "policyname": "gm_update",
    "cmd": "UPDATE",
    "roles": "{authenticated}",
    "qual": "(user_id = auth.uid())",
    "with_check": "(user_id = auth.uid())"
  },
  {
    "tablename": "group_messages",
    "policyname": "msg_select",
    "cmd": "SELECT",
    "roles": "{authenticated}",
    "qual": "bounty.is_group_member(group_id)",
    "with_check": null
  },
  {
    "tablename": "groups",
    "policyname": "groups_delete",
    "cmd": "DELETE",
    "roles": "{authenticated}",
    "qual": "(owner_id = auth.uid())",
    "with_check": null
  },
  {
    "tablename": "groups",
    "policyname": "groups_select",
    "cmd": "SELECT",
    "roles": "{authenticated}",
    "qual": "bounty.is_group_member(id)",
    "with_check": null
  },
  {
    "tablename": "groups",
    "policyname": "groups_update",
    "cmd": "UPDATE",
    "roles": "{authenticated}",
    "qual": "(owner_id = auth.uid())",
    "with_check": "(owner_id = auth.uid())"
  },
  {
    "tablename": "notification_settings",
    "policyname": "notif_own",
    "cmd": "ALL",
    "roles": "{authenticated}",
    "qual": "(user_id = auth.uid())",
    "with_check": "(user_id = auth.uid())"
  },
  {
    "tablename": "notification_settings",
    "policyname": "notif_select",
    "cmd": "SELECT",
    "roles": "{authenticated}",
    "qual": "(user_id = auth.uid())",
    "with_check": null
  },
  {
    "tablename": "notification_settings",
    "policyname": "notif_update",
    "cmd": "UPDATE",
    "roles": "{authenticated}",
    "qual": "(user_id = auth.uid())",
    "with_check": "(user_id = auth.uid())"
  },
  {
    "tablename": "profiles",
    "policyname": "profiles_insert",
    "cmd": "INSERT",
    "roles": "{authenticated}",
    "qual": null,
    "with_check": "(id = auth.uid())"
  },
  {
    "tablename": "profiles",
    "policyname": "profiles_select",
    "cmd": "SELECT",
    "roles": "{authenticated}",
    "qual": "bounty.can_view_profile(id)",
    "with_check": null
  },
  {
    "tablename": "profiles",
    "policyname": "profiles_update",
    "cmd": "UPDATE",
    "roles": "{authenticated}",
    "qual": "(id = auth.uid())",
    "with_check": "(id = auth.uid())"
  },
  {
    "tablename": "push_tokens",
    "policyname": "push_own",
    "cmd": "ALL",
    "roles": "{authenticated}",
    "qual": "(user_id = auth.uid())",
    "with_check": "(user_id = auth.uid())"
  },
  {
    "tablename": "push_tokens",
    "policyname": "push_tokens_delete",
    "cmd": "DELETE",
    "roles": "{authenticated}",
    "qual": "(user_id = auth.uid())",
    "with_check": null
  },
  {
    "tablename": "push_tokens",
    "policyname": "push_tokens_insert",
    "cmd": "INSERT",
    "roles": "{authenticated}",
    "qual": null,
    "with_check": "(user_id = auth.uid())"
  },
  {
    "tablename": "push_tokens",
    "policyname": "push_tokens_select",
    "cmd": "SELECT",
    "roles": "{authenticated}",
    "qual": "(user_id = auth.uid())",
    "with_check": null
  },
  {
    "tablename": "reactions",
    "policyname": "rx_delete",
    "cmd": "DELETE",
    "roles": "{authenticated}",
    "qual": "(user_id = auth.uid())",
    "with_check": null
  },
  {
    "tablename": "reactions",
    "policyname": "rx_insert",
    "cmd": "INSERT",
    "roles": "{authenticated}",
    "qual": null,
    "with_check": "((user_id = auth.uid()) AND (EXISTS ( SELECT 1\n   FROM bounty.group_messages m\n  WHERE ((m.id = reactions.message_id) AND bounty.is_group_member(m.group_id)))))"
  },
  {
    "tablename": "reactions",
    "policyname": "rx_select",
    "cmd": "SELECT",
    "roles": "{authenticated}",
    "qual": "(EXISTS ( SELECT 1\n   FROM bounty.group_messages m\n  WHERE ((m.id = reactions.message_id) AND bounty.is_group_member(m.group_id))))",
    "with_check": null
  },
  {
    "tablename": "recurring_expenses",
    "policyname": "recurring_own",
    "cmd": "ALL",
    "roles": "{authenticated}",
    "qual": "(user_id = auth.uid())",
    "with_check": "(user_id = auth.uid())"
  },
  {
    "tablename": "trophies",
    "policyname": "trophy_select",
    "cmd": "SELECT",
    "roles": "{authenticated}",
    "qual": "bounty.can_view_profile(user_id)",
    "with_check": null
  }
]
```
