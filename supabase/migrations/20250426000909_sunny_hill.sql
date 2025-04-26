/*
  # Restaurant Management System Schema

  1. New Tables
    - `profiles`
      - User profiles with roles (customer/admin)
    - `categories`
      - Menu item categories (e.g., Appetizers, Main Course, Desserts)
    - `menu_items`
      - Restaurant menu items with prices and descriptions
    - `orders`
      - Customer orders
    - `order_items`
      - Individual items within orders

  2. Security
    - Enable RLS on all tables
    - Policies for:
      - Customers can read all menu items
      - Customers can create and read their own orders
      - Admins have full access to all tables
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  image_url text,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  special_instructions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL CHECK (unit_price >= 0),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify categories"
  ON categories FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

-- Menu items policies
CREATE POLICY "Menu items are viewable by everyone"
  ON menu_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify menu items"
  ON menu_items FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

-- Orders policies
CREATE POLICY "Customers can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

CREATE POLICY "Customers can create their own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

-- Order items policies
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    ))
  ));

CREATE POLICY "Users can create order items for their orders"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  ));

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();