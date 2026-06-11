export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type TableDefinition<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDefinition<
        {
          id: string;
          display_name: string;
          avatar_id: string;
          starting_weight: number | null;
          current_weight: number | null;
          goal_weight: number | null;
          created_at: string;
          updated_at: string;
        },
        {
          id: string;
          display_name: string;
          avatar_id?: string;
          starting_weight?: number | null;
          current_weight?: number | null;
          goal_weight?: number | null;
        }
      >;
      groups: TableDefinition<
        {
          id: string;
          name: string;
          created_by: string;
          created_at: string;
        },
        {
          id?: string;
          name: string;
          created_by: string;
        }
      >;
      group_members: TableDefinition<
        {
          group_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        },
        {
          group_id: string;
          user_id: string;
          role?: string;
        }
      >;
      competitions: TableDefinition<
        {
          id: string;
          group_id: string;
          name: string;
          start_date: string;
          end_date: string;
          weekly_weigh_in_day: number;
          water_goal: number;
          progress_type: string;
          created_at: string;
        },
        {
          id?: string;
          group_id: string;
          name: string;
          start_date: string;
          end_date: string;
          weekly_weigh_in_day: number;
          water_goal?: number;
          progress_type?: string;
        }
      >;
      daily_logs: TableDefinition<
        {
          id: string;
          user_id: string;
          competition_id: string;
          log_date: string;
          water_cups: number;
          water_goal: number;
          workout_completed: boolean;
          workout_goal_minutes: number;
          workout_muscle_groups: string[];
          custom_workout_muscle_groups: string[];
          meal_photo_count: number;
          meal_photo_bonus_earned: boolean;
          completed: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          competition_id: string;
          log_date: string;
          water_cups?: number;
          water_goal?: number;
          workout_completed?: boolean;
          workout_goal_minutes?: number;
          workout_muscle_groups?: string[];
          custom_workout_muscle_groups?: string[];
          meal_photo_count?: number;
          meal_photo_bonus_earned?: boolean;
          completed?: boolean;
        }
      >;
      weight_entries: TableDefinition<
        {
          id: string;
          competition_id: string;
          user_id: string;
          entry_date: string;
          weight: number;
          is_weekly_weigh_in: boolean;
          created_at: string;
        },
        {
          id?: string;
          competition_id: string;
          user_id: string;
          entry_date: string;
          weight: number;
          is_weekly_weigh_in?: boolean;
        }
      >;
      workout_logs: TableDefinition<
        {
          id: string;
          daily_log_id: string;
          user_id: string;
          completed: boolean;
          duration_minutes: number | null;
          muscle_groups: string[];
          custom_muscle_groups: string[];
          import_source: string;
          external_id: string | null;
          raw_import: Json | null;
          created_at: string;
        },
        {
          id?: string;
          daily_log_id: string;
          user_id: string;
          completed?: boolean;
          duration_minutes?: number | null;
          muscle_groups?: string[];
          custom_muscle_groups?: string[];
          import_source?: string;
          external_id?: string | null;
          raw_import?: Json | null;
        }
      >;
      meal_logs: TableDefinition<
        {
          id: string;
          daily_log_id: string;
          user_id: string;
          photo_url: string | null;
          bonus_earned: boolean;
          created_at: string;
        },
        {
          id?: string;
          daily_log_id: string;
          user_id: string;
          photo_url?: string | null;
          bonus_earned?: boolean;
        }
      >;
      rival_actions: TableDefinition<
        {
          id: string;
          competition_id: string;
          from_user_id: string;
          to_user_id: string;
          action_type: string;
          reason: string;
          cosmetic_only: boolean;
          created_at: string;
        },
        {
          id?: string;
          competition_id: string;
          from_user_id: string;
          to_user_id: string;
          action_type: string;
          reason: string;
          cosmetic_only?: boolean;
        }
      >;
      group_invites: TableDefinition<
        {
          id: string;
          group_id: string;
          code: string;
          created_by: string;
          used_by: string | null;
          used_at: string | null;
          expires_at: string;
          created_at: string;
        },
        {
          id?: string;
          group_id: string;
          code: string;
          created_by: string;
          used_by?: string | null;
          used_at?: string | null;
          expires_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
