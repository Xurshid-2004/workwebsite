export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type TableDef<Row, Insert = Row, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<
        ProfileRow,
        Partial<ProfileRow> & Pick<ProfileRow, 'id' | 'email' | 'name'>,
        Partial<ProfileRow>
      >;
      categories: TableDef<CategoryRow, CategoryRow, Partial<CategoryRow>>;
      jobs: TableDef<
        JobRow,
        Partial<JobRow> &
          Pick<
            JobRow,
            | 'id'
            | 'title'
            | 'company_id'
            | 'company_name'
            | 'category_id'
            | 'poster_id'
            | 'description'
            | 'work_type'
            | 'schedule_type'
            | 'location'
          >,
        Partial<JobRow>
      >;
      favorites: TableDef<FavoriteRow, Pick<FavoriteRow, 'user_id' | 'job_id'>, Partial<FavoriteRow>>;
      chats: TableDef<ChatRow, Partial<ChatRow> & Pick<ChatRow, 'id'>, Partial<ChatRow>>;
      chat_participants: TableDef<
        ChatParticipantRow,
        Pick<ChatParticipantRow, 'chat_id' | 'user_id'>,
        Partial<ChatParticipantRow>
      >;
      messages: TableDef<
        MessageRow,
        Partial<MessageRow> & Pick<MessageRow, 'id' | 'chat_id' | 'sender_id' | 'body'>,
        Partial<Pick<MessageRow, 'read'>>
      >;
      reports: TableDef<
        ReportRow,
        Partial<ReportRow> & Pick<ReportRow, 'reporter_id' | 'target_type' | 'target_id' | 'reason'>,
        Partial<Pick<ReportRow, 'status'>>
      >;
      locations: TableDef<
        LocationRow,
        Pick<LocationRow, 'id' | 'label' | 'slug'> & Partial<Pick<LocationRow, 'is_active'>>,
        Partial<Pick<LocationRow, 'label' | 'slug' | 'is_active'>>
      >;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export interface ChatParticipantRow {
  chat_id: string;
  user_id: string;
}

export interface FavoriteRow {
  user_id: string;
  job_id: string;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  title: string | null;
  avatar_url: string | null;
  role: string;
  profile_role: string;
  language: string;
  notifications: Json;
  badge: string | null;
  company_id: string | null;
  blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  icon: string;
  created_at: string;
}

export interface JobRow {
  id: string;
  title: string;
  company_id: string;
  company_name: string;
  company_logo: string | null;
  category_id: string;
  poster_id: string;
  description: string;
  requirements: Json;
  responsibilities: Json | null;
  status: string;
  work_type: string;
  schedule_type: string;
  schedule_pattern: string;
  location: Json;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  skills: Json;
  is_featured: boolean;
  contact_phone: string | null;
  address: string | null;
  district: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatRow {
  id: string;
  job_id: string | null;
  last_message_id: string | null;
  updated_at: string;
  created_at: string;
}

export interface MessageRow {
  id: string;
  chat_id: string;
  sender_id: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface LocationRow {
  id: string;
  label: string;
  slug: string;
  is_active: boolean;
  created_at: string;
}

export interface ReportRow {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
}
