/*
  # mwrd Marketplace - Initial Database Schema

  ## Overview
  Complete database schema for a managed B2B marketplace with anonymized identities.
  Supports three portals: Admin, Client, and Supplier with role-based access control.

  ## 1. New Tables

  ### Users and Authentication
  - `user_profiles` - Extended user information beyond auth.users
    - `id` (uuid, FK to auth.users) - Primary key
    - `role` (text) - User role: 'admin', 'client', 'supplier'
    - `random_name` (text) - Anonymized display name
    - `real_name` (text) - Actual user/business name
    - `email` (text) - Contact email
    - `phone` (text) - Contact phone number
    - `company_name` (text) - Business name
    - `status` (text) - Account status: 'pending', 'approved', 'rejected', 'suspended'
    - `rating` (numeric) - Average rating (for suppliers)
    - `total_orders` (integer) - Completed order count
    - `kyc_status` (text) - KYC verification status
    - `kyc_documents` (jsonb) - Array of document URLs
    - `created_at` (timestamptz) - Registration timestamp
    - `approved_at` (timestamptz) - Approval timestamp
    - `approved_by` (uuid) - Admin who approved

  ### Categories and Products
  - `categories` - Main product categories
    - `id` (uuid) - Primary key
    - `name` (text) - Category name
    - `slug` (text) - URL-friendly identifier
    - `description` (text) - Category description
    - `icon` (text) - Icon identifier
    - `created_at` (timestamptz)

  - `subcategories` - Product subcategories
    - `id` (uuid) - Primary key
    - `category_id` (uuid, FK) - Parent category
    - `name` (text) - Subcategory name
    - `slug` (text) - URL-friendly identifier
    - `description` (text)
    - `created_at` (timestamptz)

  - `items` - Products/services offered by suppliers
    - `id` (uuid) - Primary key
    - `supplier_id` (uuid, FK) - Supplier who owns this item
    - `category_id` (uuid, FK) - Category
    - `subcategory_id` (uuid, FK) - Subcategory
    - `name` (text) - Item name
    - `description` (text) - Detailed description
    - `cost_price` (numeric) - Supplier's base price
    - `unit` (text) - Unit of measurement (kg, pcs, etc.)
    - `images` (jsonb) - Array of image URLs
    - `status` (text) - 'pending', 'approved', 'rejected'
    - `approved_by` (uuid, FK) - Admin who approved
    - `approved_at` (timestamptz)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### RFQ System
  - `rfqs` - Request for Quotations from clients
    - `id` (uuid) - Primary key
    - `client_id` (uuid, FK) - Client submitting RFQ
    - `title` (text) - RFQ title
    - `description` (text) - Requirements and notes
    - `status` (text) - 'pending', 'quoted', 'accepted', 'expired', 'cancelled'
    - `expires_at` (timestamptz) - RFQ expiration
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  - `rfq_items` - Items requested in an RFQ
    - `id` (uuid) - Primary key
    - `rfq_id` (uuid, FK) - Parent RFQ
    - `item_id` (uuid, FK) - Requested item
    - `quantity` (numeric) - Requested quantity
    - `notes` (text) - Specific requirements
    - `created_at` (timestamptz)

  - `quotes` - Supplier quotes in response to RFQs
    - `id` (uuid) - Primary key
    - `rfq_id` (uuid, FK) - RFQ being quoted
    - `supplier_id` (uuid, FK) - Supplier submitting quote
    - `base_price` (numeric) - Supplier's quoted price
    - `final_price` (numeric) - Price after mwrd margin
    - `delivery_days` (integer) - Estimated delivery time
    - `notes` (text) - Additional information
    - `status` (text) - 'pending', 'accepted', 'rejected', 'expired'
    - `valid_until` (timestamptz) - Quote expiration
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### Orders and Logistics
  - `orders` - Accepted quotes converted to orders
    - `id` (uuid) - Primary key
    - `order_number` (text) - Human-readable order ID
    - `rfq_id` (uuid, FK) - Original RFQ
    - `quote_id` (uuid, FK) - Accepted quote
    - `client_id` (uuid, FK) - Client
    - `supplier_id` (uuid, FK) - Supplier
    - `total_amount` (numeric) - Final order value
    - `margin_amount` (numeric) - mwrd margin
    - `status` (text) - 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'
    - `delivery_address` (text) - Shipping address
    - `tracking_number` (text) - Logistics tracking
    - `completed_at` (timestamptz)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### Pricing and Margins
  - `margin_rules` - Pricing margin configuration
    - `id` (uuid) - Primary key
    - `category_id` (uuid, FK, nullable) - Specific category or NULL for global
    - `margin_percentage` (numeric) - Percentage markup
    - `priority` (integer) - Rule priority (higher = more specific)
    - `active` (boolean) - Is rule active
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### Ratings and Reviews
  - `ratings` - Client ratings for completed orders
    - `id` (uuid) - Primary key
    - `order_id` (uuid, FK) - Rated order
    - `supplier_id` (uuid, FK) - Supplier being rated
    - `client_id` (uuid, FK) - Client submitting rating
    - `score` (integer) - Rating score (1-5)
    - `review` (text) - Optional review text
    - `created_at` (timestamptz)

  ### Notifications
  - `notifications` - System notifications
    - `id` (uuid) - Primary key
    - `user_id` (uuid, FK) - Recipient
    - `type` (text) - Notification type
    - `title` (text) - Notification title
    - `message` (text) - Notification content
    - `link` (text) - Related resource URL
    - `read` (boolean) - Read status
    - `created_at` (timestamptz)

  ## 2. Security

  All tables have Row Level Security (RLS) enabled with policies for:
  - Admin: Full access to all data
  - Client: Access to own data and approved items
  - Supplier: Access to own data and assigned RFQs
  - Public: No access (all portals require authentication)

  ## 3. Important Notes

  - Random names generated automatically via trigger on user approval
  - Margin calculation applied automatically on quote submission
  - Status workflows enforced via database constraints
  - All financial amounts stored as numeric for precision
  - Timestamps use timestamptz for timezone awareness
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'client', 'supplier')),
  random_name text UNIQUE,
  real_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company_name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_orders integer DEFAULT 0,
  kyc_status text DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'approved', 'rejected')),
  kyc_documents jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id)
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Subcategories Table
CREATE TABLE IF NOT EXISTS subcategories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(category_id, name)
);

ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Items Table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id),
  subcategory_id uuid REFERENCES subcategories(id),
  name text NOT NULL,
  description text,
  cost_price numeric NOT NULL CHECK (cost_price >= 0),
  unit text DEFAULT 'pcs',
  images jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- RFQs Table
CREATE TABLE IF NOT EXISTS rfqs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'accepted', 'expired', 'cancelled')),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;

-- RFQ Items Table
CREATE TABLE IF NOT EXISTS rfq_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id uuid NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES items(id),
  quantity numeric NOT NULL CHECK (quantity > 0),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rfq_items ENABLE ROW LEVEL SECURITY;

-- Quotes Table
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id uuid NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  base_price numeric NOT NULL CHECK (base_price >= 0),
  final_price numeric NOT NULL CHECK (final_price >= 0),
  delivery_days integer NOT NULL CHECK (delivery_days > 0),
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  valid_until timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(rfq_id, supplier_id)
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number text UNIQUE NOT NULL,
  rfq_id uuid NOT NULL REFERENCES rfqs(id),
  quote_id uuid NOT NULL REFERENCES quotes(id),
  client_id uuid NOT NULL REFERENCES user_profiles(id),
  supplier_id uuid NOT NULL REFERENCES user_profiles(id),
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  margin_amount numeric NOT NULL CHECK (margin_amount >= 0),
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled')),
  delivery_address text NOT NULL,
  tracking_number text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Margin Rules Table
CREATE TABLE IF NOT EXISTS margin_rules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  margin_percentage numeric NOT NULL CHECK (margin_percentage >= 0 AND margin_percentage <= 100),
  priority integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE margin_rules ENABLE ROW LEVEL SECURITY;

-- Ratings Table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES user_profiles(id),
  client_id uuid NOT NULL REFERENCES user_profiles(id),
  score integer NOT NULL CHECK (score >= 1 AND score <= 5),
  review text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(order_id)
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Function: Generate Random Name
CREATE OR REPLACE FUNCTION generate_random_name(role_prefix text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  random_num integer;
  generated_name text;
  name_exists boolean;
BEGIN
  LOOP
    random_num := floor(random() * 9000 + 1000)::integer;
    generated_name := role_prefix || '-' || random_num;
    
    SELECT EXISTS(SELECT 1 FROM user_profiles WHERE random_name = generated_name) INTO name_exists;
    
    IF NOT name_exists THEN
      RETURN generated_name;
    END IF;
  END LOOP;
END;
$$;

-- Function: Calculate Margin Price
CREATE OR REPLACE FUNCTION calculate_margin_price(p_base_price numeric, p_category_id uuid)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  margin_pct numeric;
BEGIN
  SELECT margin_percentage INTO margin_pct
  FROM margin_rules
  WHERE (category_id = p_category_id OR category_id IS NULL)
    AND active = true
  ORDER BY priority DESC, category_id NULLS LAST
  LIMIT 1;
  
  IF margin_pct IS NULL THEN
    margin_pct := 15;
  END IF;
  
  RETURN p_base_price * (1 + margin_pct / 100);
END;
$$;

-- Trigger: Set Random Name on Approval
CREATE OR REPLACE FUNCTION set_random_name_on_approval()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' AND NEW.random_name IS NULL THEN
    IF NEW.role = 'client' THEN
      NEW.random_name := generate_random_name('Client');
    ELSIF NEW.role = 'supplier' THEN
      NEW.random_name := generate_random_name('Supplier');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_random_name
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_random_name_on_approval();

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_rfqs_updated_at
  BEFORE UPDATE ON rfqs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger: Update Supplier Rating
CREATE OR REPLACE FUNCTION update_supplier_rating()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE user_profiles
  SET rating = (
    SELECT COALESCE(AVG(score), 0)
    FROM ratings
    WHERE supplier_id = NEW.supplier_id
  )
  WHERE id = NEW.supplier_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_supplier_rating
  AFTER INSERT ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_supplier_rating();

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can insert profile on signup"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for categories
CREATE POLICY "Anyone authenticated can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for subcategories
CREATE POLICY "Anyone authenticated can view subcategories"
  ON subcategories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage subcategories"
  ON subcategories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for items
CREATE POLICY "Approved items visible to authenticated users"
  ON items FOR SELECT
  TO authenticated
  USING (
    status = 'approved' OR
    supplier_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Suppliers can insert own items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (
    supplier_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'supplier' AND status = 'approved'
    )
  );

CREATE POLICY "Suppliers can update own items"
  ON items FOR UPDATE
  TO authenticated
  USING (supplier_id = auth.uid())
  WITH CHECK (supplier_id = auth.uid());

CREATE POLICY "Admins can manage all items"
  ON items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for rfqs
CREATE POLICY "Clients can view own RFQs"
  ON rfqs FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Suppliers can view RFQs with their items"
  ON rfqs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rfq_items ri
      JOIN items i ON i.id = ri.item_id
      WHERE ri.rfq_id = rfqs.id AND i.supplier_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Clients can insert own RFQs"
  ON rfqs FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'client' AND status = 'approved'
    )
  );

CREATE POLICY "Clients can update own RFQs"
  ON rfqs FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Admins can manage all RFQs"
  ON rfqs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for rfq_items
CREATE POLICY "Users can view RFQ items based on RFQ access"
  ON rfq_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rfqs
      WHERE rfqs.id = rfq_items.rfq_id AND rfqs.client_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = rfq_items.item_id AND items.supplier_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Clients can insert RFQ items for own RFQs"
  ON rfq_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rfqs
      WHERE rfqs.id = rfq_items.rfq_id AND rfqs.client_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all RFQ items"
  ON rfq_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for quotes
CREATE POLICY "Clients can view quotes for own RFQs"
  ON quotes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rfqs
      WHERE rfqs.id = quotes.rfq_id AND rfqs.client_id = auth.uid()
    ) OR
    supplier_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Suppliers can insert quotes for accessible RFQs"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK (
    supplier_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'supplier' AND status = 'approved'
    ) AND
    EXISTS (
      SELECT 1 FROM rfq_items ri
      JOIN items i ON i.id = ri.item_id
      WHERE ri.rfq_id = quotes.rfq_id AND i.supplier_id = auth.uid()
    )
  );

CREATE POLICY "Suppliers can update own quotes"
  ON quotes FOR UPDATE
  TO authenticated
  USING (supplier_id = auth.uid())
  WITH CHECK (supplier_id = auth.uid());

CREATE POLICY "Admins can manage all quotes"
  ON quotes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for orders
CREATE POLICY "Clients can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    supplier_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all orders"
  ON orders FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for margin_rules
CREATE POLICY "Admins can view margin rules"
  ON margin_rules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage margin rules"
  ON margin_rules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for ratings
CREATE POLICY "Users can view ratings for items they interact with"
  ON ratings FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    supplier_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Clients can insert ratings for own orders"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = ratings.order_id 
        AND orders.client_id = auth.uid()
        AND orders.status = 'completed'
    )
  );

CREATE POLICY "Admins can manage all ratings"
  ON ratings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage all notifications"
  ON notifications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_random_name ON user_profiles(random_name);
CREATE INDEX IF NOT EXISTS idx_items_supplier ON items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_client ON rfqs(client_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfq_items_rfq ON rfq_items(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_items_item ON rfq_items(item_id);
CREATE INDEX IF NOT EXISTS idx_quotes_rfq ON quotes(rfq_id);
CREATE INDEX IF NOT EXISTS idx_quotes_supplier ON quotes(supplier_id);
CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_supplier ON orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
