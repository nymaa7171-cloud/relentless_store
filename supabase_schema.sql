-- ============================================
-- RELENTLESS - Supabase Database Schema
-- ============================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  price         NUMERIC(12, 2) NOT NULL,
  sport_category     TEXT,
  function_category  TEXT,
  stock         INTEGER,
  status        TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'preorder')),
  description   TEXT,
  image_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ORDERS TABLE
-- order_number: auto-increment дараалсан захиалгын дугаар
CREATE SEQUENCE IF NOT EXISTS orders_order_number_seq START 1000;

CREATE TABLE IF NOT EXISTS orders (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number  INTEGER DEFAULT nextval('orders_order_number_seq') NOT NULL UNIQUE,
  user_name     TEXT NOT NULL,
  phone         TEXT NOT NULL,
  instagram     TEXT,
  product_id    UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  product_status TEXT DEFAULT 'available',
  size          TEXT NOT NULL,
  price         NUMERIC(12, 2) NOT NULL,
  city          TEXT DEFAULT 'Улаанбаатар',
  district      TEXT NOT NULL,
  address       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Products: нийтэд үзэх боломжтой
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (true);

CREATE POLICY "products_anon_insert" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "products_anon_update" ON products
  FOR UPDATE USING (true);

CREATE POLICY "products_anon_delete" ON products
  FOR DELETE USING (true);

-- Orders: нийтэд оруулах, унших боломжтой (анон хэрэглэгчид)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_public_insert" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "orders_public_read" ON orders
  FOR SELECT USING (true);

CREATE POLICY "orders_public_update" ON orders
  FOR UPDATE USING (true);

CREATE POLICY "orders_public_delete" ON orders
  FOR DELETE USING (true);

-- ============================================
-- REALTIME (live orders for admin)
-- ============================================
-- Supabase dashboard дээр:
-- Table Editor > orders > Enable Realtime гэж тохируулна

-- ============================================
-- ЖИШЭЭ ӨГӨГДӨЛ (Optional seed data)
-- ============================================
INSERT INTO products (name, price, sport_category, function_category, stock, status, description) VALUES
  ('Pro Running Jacket', 189000, 'Гүйлт', 'Дээд хэсэг', 15, 'available', 'Хөнгөн, агааржуулалттай гүйлтийн куртка. Борооны эсрэг хамгаалалттай.'),
  ('Elite Training Shorts', 89000, 'Фитнесс', 'Доод хэсэг', 20, 'available', 'Дөрвөн талдаа сунадаг, чийг шингээдэггүй материал.'),
  ('Mountain Bike Jersey', 149000, 'Уулын дугуй', 'Дээд хэсэг', 8, 'preorder', 'Аэродинамик дизайн, задгай гудастай гар.)'),
  ('Performance Hoodie', 220000, 'Фитнесс', 'Дээд хэсэг', 12, 'available', 'Хүнд биеийн дасгалд зориулсан флис дотортой худди.');
