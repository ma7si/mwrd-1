/*
  # Fix All RLS Infinite Recursion Issues

  ## Problem
  Multiple tables have policies that query user_profiles to check for admin role,
  causing infinite recursion when those policies are evaluated.

  ## Solution
  Replace all user_profiles subqueries with the is_admin() helper function
  across all affected tables.

  ## Tables Fixed
  - items
  - rfqs
  - rfq_items
  - quotes
  - orders

  ## Changes
  1. Drop all problematic policies
  2. Recreate them using is_admin() function
*/

-- ============================================================================
-- ITEMS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage all items" ON items;
DROP POLICY IF EXISTS "Approved items visible to authenticated users" ON items;
DROP POLICY IF EXISTS "Suppliers can insert own items" ON items;

CREATE POLICY "Admins can manage all items"
  ON items FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Approved items visible to authenticated users"
  ON items FOR SELECT
  TO authenticated
  USING (
    status = 'approved' 
    OR supplier_id = auth.uid() 
    OR is_admin()
  );

CREATE POLICY "Suppliers can insert own items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (
    supplier_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'supplier'
      AND status = 'approved'
    )
  );

-- ============================================================================
-- RFQS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage all RFQs" ON rfqs;
DROP POLICY IF EXISTS "Clients can view own RFQs" ON rfqs;
DROP POLICY IF EXISTS "Suppliers can view RFQs with their items" ON rfqs;
DROP POLICY IF EXISTS "Clients can insert own RFQs" ON rfqs;

CREATE POLICY "Admins can manage all RFQs"
  ON rfqs FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Clients can view own RFQs"
  ON rfqs FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() 
    OR is_admin()
  );

CREATE POLICY "Suppliers can view RFQs with their items"
  ON rfqs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rfq_items ri
      JOIN items i ON i.id = ri.item_id
      WHERE ri.rfq_id = rfqs.id
      AND i.supplier_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY "Clients can insert own RFQs"
  ON rfqs FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'client'
      AND status = 'approved'
    )
  );

-- ============================================================================
-- RFQ_ITEMS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage all RFQ items" ON rfq_items;
DROP POLICY IF EXISTS "Users can view RFQ items based on RFQ access" ON rfq_items;
DROP POLICY IF EXISTS "Clients can insert RFQ items for own RFQs" ON rfq_items;

CREATE POLICY "Admins can manage all RFQ items"
  ON rfq_items FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can view RFQ items based on RFQ access"
  ON rfq_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rfqs
      WHERE rfqs.id = rfq_items.rfq_id
      AND rfqs.client_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM items
      WHERE items.id = rfq_items.item_id
      AND items.supplier_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY "Clients can insert RFQ items for own RFQs"
  ON rfq_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rfqs
      WHERE rfqs.id = rfq_items.rfq_id
      AND rfqs.client_id = auth.uid()
    )
  );

-- ============================================================================
-- QUOTES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage all quotes" ON quotes;
DROP POLICY IF EXISTS "Clients can view quotes for own RFQs" ON quotes;
DROP POLICY IF EXISTS "Suppliers can insert quotes for accessible RFQs" ON quotes;

CREATE POLICY "Admins can manage all quotes"
  ON quotes FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Clients can view quotes for own RFQs"
  ON quotes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rfqs
      WHERE rfqs.id = quotes.rfq_id
      AND rfqs.client_id = auth.uid()
    )
    OR supplier_id = auth.uid()
    OR is_admin()
  );

CREATE POLICY "Suppliers can insert quotes for accessible RFQs"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK (
    supplier_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'supplier'
      AND status = 'approved'
    )
    AND EXISTS (
      SELECT 1 FROM rfq_items ri
      JOIN items i ON i.id = ri.item_id
      WHERE ri.rfq_id = quotes.rfq_id
      AND i.supplier_id = auth.uid()
    )
  );

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;
DROP POLICY IF EXISTS "Clients can view own orders" ON orders;

CREATE POLICY "Admins can manage all orders"
  ON orders FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Clients can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid()
    OR supplier_id = auth.uid()
    OR is_admin()
  );
