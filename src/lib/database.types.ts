export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'client' | 'supplier';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type KycStatus = 'pending' | 'submitted' | 'approved' | 'rejected';
export type ItemStatus = 'pending' | 'approved' | 'rejected';
export type RfqStatus = 'pending' | 'quoted' | 'accepted' | 'expired' | 'cancelled';
export type QuoteStatus = 'pending' | 'accepted' | 'rejected' | 'expired';
export type OrderStatus = 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          role: UserRole;
          random_name: string | null;
          real_name: string;
          email: string;
          phone: string | null;
          company_name: string | null;
          status: UserStatus;
          rating: number;
          total_orders: number;
          kyc_status: KycStatus;
          kyc_documents: Json;
          created_at: string;
          approved_at: string | null;
          approved_by: string | null;
        };
        Insert: {
          id: string;
          role: UserRole;
          random_name?: string | null;
          real_name: string;
          email: string;
          phone?: string | null;
          company_name?: string | null;
          status?: UserStatus;
          rating?: number;
          total_orders?: number;
          kyc_status?: KycStatus;
          kyc_documents?: Json;
          created_at?: string;
          approved_at?: string | null;
          approved_by?: string | null;
        };
        Update: {
          id?: string;
          role?: UserRole;
          random_name?: string | null;
          real_name?: string;
          email?: string;
          phone?: string | null;
          company_name?: string | null;
          status?: UserStatus;
          rating?: number;
          total_orders?: number;
          kyc_status?: KycStatus;
          kyc_documents?: Json;
          created_at?: string;
          approved_at?: string | null;
          approved_by?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string;
        };
      };
      subcategories: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          supplier_id: string;
          category_id: string;
          subcategory_id: string | null;
          name: string;
          description: string | null;
          cost_price: number;
          unit: string;
          images: Json;
          status: ItemStatus;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          category_id: string;
          subcategory_id?: string | null;
          name: string;
          description?: string | null;
          cost_price: number;
          unit?: string;
          images?: Json;
          status?: ItemStatus;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          supplier_id?: string;
          category_id?: string;
          subcategory_id?: string | null;
          name?: string;
          description?: string | null;
          cost_price?: number;
          unit?: string;
          images?: Json;
          status?: ItemStatus;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rfqs: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          description: string | null;
          status: RfqStatus;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          description?: string | null;
          status?: RfqStatus;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          title?: string;
          description?: string | null;
          status?: RfqStatus;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      rfq_items: {
        Row: {
          id: string;
          rfq_id: string;
          item_id: string;
          quantity: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          rfq_id: string;
          item_id: string;
          quantity: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          rfq_id?: string;
          item_id?: string;
          quantity?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
      quotes: {
        Row: {
          id: string;
          rfq_id: string;
          supplier_id: string;
          base_price: number;
          final_price: number;
          delivery_days: number;
          notes: string | null;
          status: QuoteStatus;
          valid_until: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          rfq_id: string;
          supplier_id: string;
          base_price: number;
          final_price: number;
          delivery_days: number;
          notes?: string | null;
          status?: QuoteStatus;
          valid_until?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          rfq_id?: string;
          supplier_id?: string;
          base_price?: number;
          final_price?: number;
          delivery_days?: number;
          notes?: string | null;
          status?: QuoteStatus;
          valid_until?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          rfq_id: string;
          quote_id: string;
          client_id: string;
          supplier_id: string;
          total_amount: number;
          margin_amount: number;
          status: OrderStatus;
          delivery_address: string;
          tracking_number: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          rfq_id: string;
          quote_id: string;
          client_id: string;
          supplier_id: string;
          total_amount: number;
          margin_amount: number;
          status?: OrderStatus;
          delivery_address: string;
          tracking_number?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          rfq_id?: string;
          quote_id?: string;
          client_id?: string;
          supplier_id?: string;
          total_amount?: number;
          margin_amount?: number;
          status?: OrderStatus;
          delivery_address?: string;
          tracking_number?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      margin_rules: {
        Row: {
          id: string;
          category_id: string | null;
          margin_percentage: number;
          priority: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          margin_percentage: number;
          priority?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          margin_percentage?: number;
          priority?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      ratings: {
        Row: {
          id: string;
          order_id: string;
          supplier_id: string;
          client_id: string;
          score: number;
          review: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          supplier_id: string;
          client_id: string;
          score: number;
          review?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          supplier_id?: string;
          client_id?: string;
          score?: number;
          review?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          link: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          link?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          link?: string | null;
          read?: boolean;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      generate_random_name: {
        Args: {
          role_prefix: string;
        };
        Returns: string;
      };
      calculate_margin_price: {
        Args: {
          p_base_price: number;
          p_category_id: string;
        };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
  };
}
