# supabase trigger log
## query used
```sql
select event_object_table as tbl,
       trigger_name,
       action_timing,
       event_manipulation,
       action_statement
from information_schema.triggers
where trigger_schema = 'bounty'
order by event_object_table, trigger_name;
```

## responses
```json
[
    {
        "tbl": "expenses",
        "trigger_name": "trg_expense_insert",
        "action_timing": "AFTER",
        "event_manipulation": "INSERT",
        "action_statement": "EXECUTE FUNCTION bounty.on_expense_insert()"
    },
    {
        "tbl": "friendships",
        "trigger_name": "friendships",
        "action_timing": "AFTER",
        "event_manipulation": "INSERT",
        "action_statement": "EXECUTE FUNCTION supabase_functions.http_request('https://utyexcfnophlxabpzbfy.supabase.co/functions/v1/push-fanout', 'POST', '{\"Content-type\":\"application/json\",\"x-webhook-secret\":\"bountyapp\"}', '{}', '5000')"
    },
    {
        "tbl": "friendships",
        "trigger_name": "trg_reciprocal_friend",
        "action_timing": "BEFORE",
        "event_manipulation": "INSERT",
        "action_statement": "EXECUTE FUNCTION bounty.handle_reciprocal_friend_request()"
    },
    {
        "tbl": "group_messages",
        "trigger_name": "group_messages",
        "action_timing": "AFTER",
        "event_manipulation": "INSERT",
        "action_statement": "EXECUTE FUNCTION supabase_functions.http_request('https://utyexcfnophlxabpzbfy.supabase.co/functions/v1/push-fanout', 'POST', '{\"Content-type\":\"application/json\",\"x-webhook-secret\":\"bountyapp\"}', '{}', '5000')"
    },
    {
        "tbl": "profiles",
        "trigger_name": "trg_lock_username",
        "action_timing": "BEFORE",
        "event_manipulation": "UPDATE",
        "action_statement": "EXECUTE FUNCTION bounty.prevent_username_change()"
    },
    {
        "tbl": "profiles",
        "trigger_name": "trg_profile_insert",
        "action_timing": "AFTER",
        "event_manipulation": "INSERT",
        "action_statement": "EXECUTE FUNCTION bounty.on_profile_insert()"
    },
    {
        "tbl": "reactions",
        "trigger_name": "reactions",
        "action_timing": "AFTER",
        "event_manipulation": "INSERT",
        "action_statement": "EXECUTE FUNCTION supabase_functions.http_request('https://utyexcfnophlxabpzbfy.supabase.co/functions/v1/push-fanout', 'POST', '{\"Content-type\":\"application/json\",\"x-webhook-secret\":\"bountyapp\"}', '{}', '5000')"
    }
]
```