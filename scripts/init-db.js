import postgres from 'postgres';
import 'dotenv/config';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString || connectionString.includes('[YOUR-PASSWORD]')) {
  console.error('\n❌ ERROR: DATABASE_URL or DIRECT_URL is missing or contains [YOUR-PASSWORD].');
  console.error('👉 Please update your .env file with your actual Supabase database password before running migrations.\n');
  process.exit(1);
}

console.log('🚀 Connecting to Supabase PostgreSQL database...');

const sql = postgres(connectionString, {
  ssl: 'require',
  connect_timeout: 15,
  prepare: false
});

export const runMigrations = async () => {
  try {
    console.log('📦 Creating database tables if not exist...');

    // 1. Settings Table
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('✅ settings table ready');

    // 2. Medicines Table
    await sql`
      CREATE TABLE IF NOT EXISTS medicines (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        generic VARCHAR(255),
        company VARCHAR(255),
        category VARCHAR(100),
        price_per_strip NUMERIC DEFAULT 0,
        pieces_per_strip INT DEFAULT 10,
        stock INT DEFAULT 0,
        discount_percent NUMERIC DEFAULT 0,
        image TEXT,
        data JSONB,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines (name);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_medicines_generic ON medicines (generic);`;
    console.log('✅ medicines table ready');

    // 3. Orders Table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(100) PRIMARY KEY,
        order_number VARCHAR(100),
        customer_name VARCHAR(255),
        customer_phone VARCHAR(50),
        delivery_address TEXT,
        payment_method VARCHAR(50),
        total NUMERIC DEFAULT 0,
        status VARCHAR(50) DEFAULT 'Pending',
        items JSONB,
        data JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders (customer_phone);`;
    console.log('✅ orders table ready');

    // 4. Prescriptions Table
    await sql`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id VARCHAR(100) PRIMARY KEY,
        customer_name VARCHAR(255),
        customer_phone VARCHAR(50),
        delivery_address TEXT,
        image_url TEXT,
        notes TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        data JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions (status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_prescriptions_phone ON prescriptions (customer_phone);`;
    console.log('✅ prescriptions table ready');

    // 5. Customers Table
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        phone VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        address TEXT,
        avatar TEXT,
        data JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('✅ customers table ready');

    console.log('\n🎉 ALL DATABASE TABLES SUCCESSFULLY CREATED IN SUPABASE POSTGRES!\n');
    return { success: true };
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
};

if (process.argv[1]?.endsWith('init-db.js')) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
