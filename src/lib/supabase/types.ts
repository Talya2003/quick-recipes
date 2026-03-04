export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      saved_recipes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          recipe_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          recipe_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          recipe_text?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      public_recipes: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          description: string;
          minutes_total: number;
          difficulty: "קל" | "בינוני";
          ingredients: string[];
          steps: string[];
          tags: string[];
          recipe_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          description: string;
          minutes_total: number;
          difficulty: "קל" | "בינוני";
          ingredients: string[];
          steps: string[];
          tags?: string[];
          recipe_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          title?: string;
          description?: string;
          minutes_total?: number;
          difficulty?: "קל" | "בינוני";
          ingredients?: string[];
          steps?: string[];
          tags?: string[];
          recipe_text?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
