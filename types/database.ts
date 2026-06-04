// ============================================================================
//  Bounty · Supabase generated-style types for the `bounty` schema
//  Hand-written equivalent of:
//    supabase gen types typescript --project-id <ref> --schema bounty
//  Keep in sync with bounty_phase2_schema.sql.
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12.2.3";
  };
  bounty: {
    Tables: {
      avatars: {
        Row: {
          id: string;
          display_name: string;
          unlock_level: number;
        };
        Insert: {
          id: string;
          display_name: string;
          unlock_level?: number;
        };
        Update: {
          id?: string;
          display_name?: string;
          unlock_level?: number;
        };
        Relationships: [];
      };
      budgets: {
        Row: {
          user_id: string;
          weekly_limit: number | null;
          share_blowout: boolean;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          weekly_limit?: number | null;
          share_blowout?: boolean;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          weekly_limit?: number | null;
          share_blowout?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budgets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          category: Database["bounty"]["Enums"]["expense_category"];
          note: string | null;
          is_recurring: boolean;
          recurring_id: string | null;
          client_uuid: string | null;
          spent_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          category: Database["bounty"]["Enums"]["expense_category"];
          note?: string | null;
          is_recurring?: boolean;
          recurring_id?: string | null;
          client_uuid?: string | null;
          spent_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          category?: Database["bounty"]["Enums"]["expense_category"];
          note?: string | null;
          is_recurring?: boolean;
          recurring_id?: string | null;
          client_uuid?: string | null;
          spent_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_recurring_id_fkey";
            columns: ["recurring_id"];
            isOneToOne: false;
            referencedRelation: "recurring_expenses";
            referencedColumns: ["id"];
          },
        ];
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          status: Database["bounty"]["Enums"]["friendship_status"];
          created_at: string;
          responded_at: string | null;
        };
        Insert: {
          id?: string;
          requester_id: string;
          addressee_id: string;
          status?: Database["bounty"]["Enums"]["friendship_status"];
          created_at?: string;
          responded_at?: string | null;
        };
        Update: {
          id?: string;
          requester_id?: string;
          addressee_id?: string;
          status?: Database["bounty"]["Enums"]["friendship_status"];
          created_at?: string;
          responded_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "friendships_requester_id_fkey";
            columns: ["requester_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "friendships_addressee_id_fkey";
            columns: ["addressee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      group_invites: {
        Row: {
          id: string;
          group_id: string;
          code: string;
          created_by: string;
          max_uses: number | null;
          uses: number;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          code: string;
          created_by: string;
          max_uses?: number | null;
          uses?: number;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          code?: string;
          created_by?: string;
          max_uses?: number | null;
          uses?: number;
          expires_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_invites_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_invites_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      group_listened_categories: {
        Row: {
          group_id: string;
          category: Database["bounty"]["Enums"]["expense_category"];
        };
        Insert: {
          group_id: string;
          category: Database["bounty"]["Enums"]["expense_category"];
        };
        Update: {
          group_id?: string;
          category?: Database["bounty"]["Enums"]["expense_category"];
        };
        Relationships: [
          {
            foreignKeyName: "group_listened_categories_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
        ];
      };
      group_members: {
        Row: {
          group_id: string;
          user_id: string;
          role: Database["bounty"]["Enums"]["member_role"];
          joined_at: string;
        };
        Insert: {
          group_id: string;
          user_id: string;
          role?: Database["bounty"]["Enums"]["member_role"];
          joined_at?: string;
        };
        Update: {
          group_id?: string;
          user_id?: string;
          role?: Database["bounty"]["Enums"]["member_role"];
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      group_messages: {
        Row: {
          id: string;
          group_id: string;
          type: Database["bounty"]["Enums"]["message_type"];
          sender_id: string | null;
          expense_id: string | null;
          category: Database["bounty"]["Enums"]["expense_category"] | null;
          amount: number | null;
          note: string | null;
          body: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          type: Database["bounty"]["Enums"]["message_type"];
          sender_id?: string | null;
          expense_id?: string | null;
          category?: Database["bounty"]["Enums"]["expense_category"] | null;
          amount?: number | null;
          note?: string | null;
          body?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          type?: Database["bounty"]["Enums"]["message_type"];
          sender_id?: string | null;
          expense_id?: string | null;
          category?: Database["bounty"]["Enums"]["expense_category"] | null;
          amount?: number | null;
          note?: string | null;
          body?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_messages_expense_id_fkey";
            columns: ["expense_id"];
            isOneToOne: false;
            referencedRelation: "expenses";
            referencedColumns: ["id"];
          },
        ];
      };
      groups: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          kind: Database["bounty"]["Enums"]["group_kind"];
          status: Database["bounty"]["Enums"]["group_status"];
          expires_at: string | null;
          final_leaderboard: Json | null;
          locked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          kind: Database["bounty"]["Enums"]["group_kind"];
          status?: Database["bounty"]["Enums"]["group_status"];
          expires_at?: string | null;
          final_leaderboard?: Json | null;
          locked_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          kind?: Database["bounty"]["Enums"]["group_kind"];
          status?: Database["bounty"]["Enums"]["group_status"];
          expires_at?: string | null;
          final_leaderboard?: Json | null;
          locked_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "groups_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_settings: {
        Row: {
          user_id: string;
          on_reaction: boolean;
          on_bounty_card: boolean;
          on_friend_request: boolean;
          on_budget_alert: boolean;
          on_group_lock: boolean;
          on_streak_reminder: boolean;
        };
        Insert: {
          user_id: string;
          on_reaction?: boolean;
          on_bounty_card?: boolean;
          on_friend_request?: boolean;
          on_budget_alert?: boolean;
          on_group_lock?: boolean;
          on_streak_reminder?: boolean;
        };
        Update: {
          user_id?: string;
          on_reaction?: boolean;
          on_bounty_card?: boolean;
          on_friend_request?: boolean;
          on_budget_alert?: boolean;
          on_group_lock?: boolean;
          on_streak_reminder?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "notification_settings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_id: string;
          timezone: string;
          xp: number;
          level: number;
          current_streak: number;
          longest_streak: number;
          last_log_date: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          avatar_id?: string;
          timezone?: string;
          xp?: number;
          level?: number;
          current_streak?: number;
          longest_streak?: number;
          last_log_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          avatar_id?: string;
          timezone?: string;
          xp?: number;
          level?: number;
          current_streak?: number;
          longest_streak?: number;
          last_log_date?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_avatar_id_fkey";
            columns: ["avatar_id"];
            isOneToOne: false;
            referencedRelation: "avatars";
            referencedColumns: ["id"];
          },
        ];
      };
      push_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          platform: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          platform: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token?: string;
          platform?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "push_tokens_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      reactions: {
        Row: {
          id: string;
          message_id: string;
          user_id: string;
          type: Database["bounty"]["Enums"]["reaction_type"];
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          user_id: string;
          type: Database["bounty"]["Enums"]["reaction_type"];
          created_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          user_id?: string;
          type?: Database["bounty"]["Enums"]["reaction_type"];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reactions_message_id_fkey";
            columns: ["message_id"];
            isOneToOne: false;
            referencedRelation: "group_messages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      recurring_expenses: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          category: Database["bounty"]["Enums"]["expense_category"];
          note: string | null;
          cadence: Database["bounty"]["Enums"]["recurrence"];
          next_occurrence: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          category: Database["bounty"]["Enums"]["expense_category"];
          note?: string | null;
          cadence: Database["bounty"]["Enums"]["recurrence"];
          next_occurrence: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          category?: Database["bounty"]["Enums"]["expense_category"];
          note?: string | null;
          cadence?: Database["bounty"]["Enums"]["recurrence"];
          next_occurrence?: string;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recurring_expenses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      trophies: {
        Row: {
          id: string;
          user_id: string;
          group_id: string | null;
          group_name: string;
          title: string;
          emoji: string;
          awarded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          group_id?: string | null;
          group_name: string;
          title: string;
          emoji?: string;
          awarded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          group_id?: string | null;
          group_name?: string;
          title?: string;
          emoji?: string;
          awarded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "trophies_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trophies_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      _award_title: {
        Args: {
          p_user: string;
          p_group: string;
          p_group_name: string;
          p_title: string;
          p_emoji: string;
        };
        Returns: undefined;
      };
      add_friend_to_group: {
        Args: { p_group: string; p_friend: string };
        Returns: undefined;
      };
      has_friendship: {
        Args: { p_other: string };
        Returns: boolean;
      };
      are_friends: {
        Args: { p_other: string };
        Returns: boolean;
      };
      award_xp: {
        Args: { p_user: string; p_amount: number };
        Returns: undefined;
      };
      can_view_profile: {
        Args: { p_other: string };
        Returns: boolean;
      };
      create_group: {
        Args: {
          p_name: string;
          p_kind: Database["bounty"]["Enums"]["group_kind"];
          p_expires_at: string | null;
          p_categories: Database["bounty"]["Enums"]["expense_category"][];
          p_invite_max_uses?: number | null;
          p_invite_expires_at?: string | null;
        };
        Returns: string;
      };
      gen_invite_code: {
        Args: { p_len?: number };
        Returns: string;
      };
      group_leaderboard: {
        Args: { p_group: string };
        Returns: {
          user_id: string;
          display_name: string;
          avatar_id: string;
          total: number;
          txns: number;
          biggest: number;
        }[];
      };
      is_group_member: {
        Args: { p_group: string };
        Returns: boolean;
      };
      join_group_with_code: {
        Args: { p_code: string };
        Returns: string;
      };
      level_for_xp: {
        Args: { p_xp: number };
        Returns: number;
      };
      lock_expired_groups: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      lock_group: {
        Args: { p_group: string };
        Returns: undefined;
      };
      materialize_recurring: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      respond_friend_request: {
        Args: { p_request: string; p_accept: boolean };
        Returns: undefined;
      };
      send_friend_request: {
        Args: { p_identifier: string };
        Returns: string;
      };
      shares_group: {
        Args: { p_other: string };
        Returns: boolean;
      };
    };
    Enums: {
      expense_category:
        | "food"
        | "transport"
        | "shopping"
        | "entertainment"
        | "bills"
        | "health"
        | "education"
        | "groceries"
        | "savings"
        | "other";
      friendship_status: "pending" | "accepted";
      group_kind: "permanent" | "temporal";
      group_status: "active" | "locked";
      member_role: "owner" | "member";
      message_type: "bounty_card" | "budget_blowout" | "system";
      reaction_type: "fire" | "skull" | "coin_shower" | "clown" | "eyes" | "crown";
      recurrence: "weekly" | "monthly";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// ── Convenience helpers, scoped to the `bounty` schema ──────────────────────
// (Simpler than the CLI's public-defaulting block, which wouldn't resolve here
//  since this project only has the `bounty` schema generated.)
type BountySchema = Database["bounty"];

export type Tables<T extends keyof BountySchema["Tables"]> =
  BountySchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof BountySchema["Tables"]> =
  BountySchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof BountySchema["Tables"]> =
  BountySchema["Tables"][T]["Update"];
export type Enums<T extends keyof BountySchema["Enums"]> =
  BountySchema["Enums"][T];

export const Constants = {
  bounty: {
    Enums: {
      expense_category: [
        "food",
        "transport",
        "shopping",
        "entertainment",
        "bills",
        "health",
        "education",
        "groceries",
        "savings",
        "other",
      ],
      friendship_status: ["pending", "accepted"],
      group_kind: ["permanent", "temporal"],
      group_status: ["active", "locked"],
      member_role: ["owner", "member"],
      message_type: ["bounty_card", "budget_blowout", "system"],
      reaction_type: ["fire", "skull", "coin_shower", "clown", "eyes", "crown"],
      recurrence: ["weekly", "monthly"],
    },
  },
} as const;